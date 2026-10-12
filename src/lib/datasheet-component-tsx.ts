import ts from "typescript"
import type { DatasheetWithPinAttributes } from "./datasheet-pin-display"
import { getDatasheetSchematicSource } from "./datasheet-schematic-symbol"

const parse = (source: string) =>
  ts.createSourceFile(
    "component.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

const findChip = (source: ts.SourceFile) => {
  let chip: ts.JsxSelfClosingElement | ts.JsxOpeningElement | undefined
  const visit = (node: ts.Node) => {
    if (chip) return
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      node.tagName.getText(source) === "chip"
    )
      chip = node
    else ts.forEachChild(node, visit)
  }
  visit(source)
  return chip
}

type Edit = { start: number; end: number; text: string }
const editSource = (source: string, edits: Edit[]) =>
  edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      source,
    )

const literal = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")

/** Merge current datasheet metadata into its published component, without evaluating it. */
export const getDatasheetComponentTsx = (
  datasheet: DatasheetWithPinAttributes,
): string | null => {
  const preview = getDatasheetSchematicSource(datasheet)
  let source = datasheet.generated_tsx?.trim() || preview
  if (
    !source &&
    !datasheet.footprinter_string?.trim() &&
    !datasheet.pin_attributes
  )
    return null
  const builtin =
    !datasheet.symbol_tsx?.trim() &&
    Boolean(datasheet.builtin_symbol_name?.trim())
  if (!source || (!datasheet.generated_tsx?.trim() && builtin))
    source = 'export default () => <chip name="U1" />'
  const file = parse(source)
  const chip = findChip(file)
  if (!chip) return source
  const updates = new Map<string, string>()
  const existing = new Map(
    chip.attributes.properties
      .filter(ts.isJsxAttribute)
      .map((attr) => [attr.name.getText(file), attr]),
  )
  if (preview && !builtin) {
    const previewFile = parse(preview)
    const previewChip = findChip(previewFile)
    for (const attr of previewChip?.attributes.properties ?? []) {
      if (!ts.isJsxAttribute(attr)) continue
      const name = attr.name.getText(previewFile)
      if (
        ["symbol", "schPinArrangement", "schWidth", "schHeight"].includes(
          name,
        ) ||
        (name === "pinLabels" && !existing.has(name))
      )
        updates.set(name, attr.getText(previewFile))
    }
  }
  if (datasheet.footprinter_string?.trim())
    updates.set(
      "footprint",
      `footprint={${literal(datasheet.footprinter_string)}}`,
    )
  if (datasheet.pin_attributes)
    updates.set(
      "pinAttributes",
      `pinAttributes={${literal(datasheet.pin_attributes)}}`,
    )
  if (builtin)
    updates.set("noSchematicRepresentation", "noSchematicRepresentation")

  const edits: Edit[] = []
  const inactive = builtin
    ? ["symbol", "schPinArrangement", "schWidth", "schHeight"]
    : datasheet.symbol_tsx?.trim()
      ? ["schPinArrangement", "noSchematicRepresentation"]
      : datasheet.sch_pin_arrangement
        ? ["symbol", "noSchematicRepresentation"]
        : []
  for (const name of inactive) {
    const previous = existing.get(name)
    if (previous)
      edits.push({
        start: previous.getStart(file),
        end: previous.end,
        text: "",
      })
  }
  const additions: string[] = []
  for (const [name, text] of updates) {
    const previous = existing.get(name)
    if (previous)
      edits.push({ start: previous.getStart(file), end: previous.end, text })
    else additions.push(text)
  }
  if (additions.length) {
    // Keep the component's final props spread last so callers can override defaults.
    const position =
      chip.attributes.properties
        .find(ts.isJsxSpreadAttribute)
        ?.getStart(file) ?? chip.attributes.end
    edits.push({
      start: position,
      end: position,
      text: `\n    ${additions.join("\n    ")}\n    `,
    })
  }
  source = editSource(source, edits)
  if (builtin && preview) {
    const updated = parse(source)
    const updatedChip = findChip(updated)!
    const element = ts.isJsxOpeningElement(updatedChip)
      ? updatedChip.parent
      : updatedChip
    const symbolFile = parse(preview)
    let symbol: ts.JsxSelfClosingElement | undefined
    const visit = (node: ts.Node) => {
      if (
        ts.isJsxSelfClosingElement(node) &&
        node.tagName.getText(symbolFile) === "schematicsymbol"
      )
        symbol = node
      ts.forEachChild(node, visit)
    }
    visit(symbolFile)
    if (symbol)
      source = editSource(source, [
        {
          start: element.getStart(updated),
          end: element.end,
          text: `<group subcircuit>\n${element.getText(updated)}\n${symbol.getText(symbolFile).replace('name="U1"', 'name="A"')}\n</group>`,
        },
      ])
  }
  return source
}

/** The abbreviated view is separate from the complete clipboard source. */
export const abbreviateComponentTsx = (source: string): string => {
  const file = parse(source)
  const edits: Edit[] = []
  const isObjectData = (expression: ts.Expression): boolean => {
    while (
      ts.isAsExpression(expression) ||
      ts.isSatisfiesExpression(expression) ||
      ts.isParenthesizedExpression(expression)
    )
      expression = expression.expression
    return (
      ts.isObjectLiteralExpression(expression) ||
      ts.isArrayLiteralExpression(expression)
    )
  }
  const complexProps = new Set([
    "pinAttributes",
    "pinLabels",
    "schPinArrangement",
    "supplierPartNumbers",
    "symbol",
  ])
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer) &&
      node.initializer.expression
    ) {
      const expression = node.initializer.expression
      if (
        complexProps.has(node.name.getText(file)) ||
        isObjectData(expression)
      ) {
        edits.push({
          start: expression.getStart(file),
          end: expression.end,
          text: "...",
        })
        return
      }
    }
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      isObjectData(node.initializer)
    ) {
      edits.push({
        start: node.initializer.getStart(file),
        end: node.initializer.end,
        text: "...",
      })
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return editSource(source, edits)
}
