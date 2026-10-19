import ts from "typescript"

export { getDatasheetComponentTsx } from "@tscircuit/parts-engine/datasheet-component-tsx"

const parse = (source: string) =>
  ts.createSourceFile(
    "component.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

type Edit = { start: number; end: number; text: string }
const editSource = (source: string, edits: Edit[]) =>
  edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      source,
    )

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
      // Keep the actual permanent pin groups visible in the component example.
      if (node.name.getText(file) === "internallyConnectedPins") return
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
