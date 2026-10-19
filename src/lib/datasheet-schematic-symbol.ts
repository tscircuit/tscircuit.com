import { createSvgUrl } from "@tscircuit/create-snippet-url"
import type { SchematicPinArrangement } from "@tscircuit/props"
import {
  type DatasheetWithPinAttributes,
  getPinNames,
} from "./datasheet-pin-display"

type SchematicDatasheet = Partial<
  Pick<
    DatasheetWithPinAttributes,
    | "chip_name"
    | "pin_information"
    | "sch_pin_arrangement"
    | "symbol_tsx"
    | "builtin_symbol_name"
  >
>

// Metadata is always a literal in generated source. Only symbol_tsx deliberately
// contains code: it is a JSX expression for chip.symbol, rendered by the SVG
// service, never evaluated by the datasheet page.
const jsxJson = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")

const getPinLabels = (datasheet: SchematicDatasheet) => {
  const pins = datasheet.pin_information ?? []
  const reserved = new Set(
    pins.flatMap((pin) => [`pin${pin.pin_number}`, pin.pin_number]),
  )
  const aliases = new Map<string, string>()
  const rawByAlias = new Map<string, string>()
  // Arrangement selectors can name a secondary function. Resolve only unique
  // matches to package pins while keeping the primary name as the display label.
  const uniquePinAliases = new Map<string, string | null>()
  for (const pin of pins) {
    const physical = `pin${pin.pin_number}`
    for (const name of getPinNames(pin)) {
      for (const alias of new Set([name, name.trim()])) {
        if (!alias) continue
        if (!uniquePinAliases.has(alias)) uniquePinAliases.set(alias, physical)
        else if (uniquePinAliases.get(alias) !== physical)
          uniquePinAliases.set(alias, null)
      }
    }
  }
  const primaryNames = pins.map(
    (pin) =>
      getPinNames(pin)
        .map((name) => name.trim())
        .find(Boolean) ?? "",
  )
  for (const name of primaryNames) {
    if (/^[A-Za-z0-9_]+$/.test(name) && !reserved.has(name)) {
      aliases.set(name, name)
      rawByAlias.set(name, name)
    }
  }
  const label = (raw: string, physical: string) => {
    if (!raw || raw === physical) return physical
    const known = aliases.get(raw)
    if (known) return known
    let alias = raw
      .replaceAll("+", "_PLUS")
      .replace(/[-−]/g, "_MINUS")
      .replace(
        /[^A-Za-z0-9_]/gu,
        (char) => `_u${char.codePointAt(0)!.toString(16)}_`,
      )
    if (reserved.has(alias)) alias = `label_${alias}`
    while (rawByAlias.has(alias) && rawByAlias.get(alias) !== raw)
      alias += "_alias"
    aliases.set(raw, alias)
    rawByAlias.set(alias, raw)
    return alias
  }
  const pinLabels = Object.fromEntries(
    pins.map((pin, index) => {
      const physical = `pin${pin.pin_number}`
      return [physical, [label(primaryNames[index], physical)]]
    }),
  )
  return { pinLabels, aliases, uniquePinAliases }
}

const getBoxDimensions = (
  arrangement: SchematicPinArrangement,
  labels: Record<string, string[]>,
) => {
  const sides = ["left", "right", "top", "bottom"] as const
  const allLabels = Object.values(labels).map(([label]) => label.length)
  const labelLengths = {} as Record<(typeof sides)[number], number>
  const counts = {} as Record<(typeof sides)[number], number>
  for (const side of sides) {
    const definition = arrangement[`${side}Side`]
    const pins = Array.isArray(definition) ? definition : definition?.pins
    counts[side] =
      pins?.length ??
      arrangement[`${side}PinCount`] ??
      arrangement[`${side}Size`] ??
      0
    labelLengths[side] = Math.max(
      0,
      ...(pins
        ? pins.map((pin) => {
            const key = String(pin).startsWith("pin")
              ? String(pin)
              : `pin${pin}`
            return labels[key]?.[0]?.length ?? String(pin).length
          })
        : counts[side] > 0
          ? allLabels
          : []),
    )
  }
  // Reserve room for vertical rail names and a center channel between signals.
  // Use core's 0.2 mm pin spacing so large parts still fit in the preview.
  const width =
    2 * Math.max(labelLengths.left, labelLengths.right) * 0.18 +
    Math.max(1.2, (Math.max(counts.top, counts.bottom) - 1) * 0.2 + 0.8)
  const height = Math.max(
    1.2,
    (labelLengths.top + labelLengths.bottom) * 0.18 + 0.8,
    (Math.max(counts.left, counts.right) - 1) * 0.2 + 0.8,
  )
  return { width: Number(width.toFixed(3)), height: Number(height.toFixed(3)) }
}

/** Prefer custom JSX, then builtin symbols, then the stored schematic box. */
export const getDatasheetSchematicSource = (
  datasheet: SchematicDatasheet,
): string | null => {
  const symbolTsx = datasheet.symbol_tsx?.trim()
  const builtinName = datasheet.builtin_symbol_name?.trim()
  const arrangement = datasheet.sch_pin_arrangement
  if (!symbolTsx && !builtinName && !arrangement) return null

  if (!symbolTsx && builtinName) {
    // Chip.symbolName is not a builtin-symbol selector. Use the schematic
    // primitive so core renders the actual symbol rather than a generic box.
    return `export default () => <schematicsymbol name="U1" displayName={${jsxJson(datasheet.chip_name ?? "U1")}} symbolName={${jsxJson(builtinName)}} />`
  }

  const { pinLabels, aliases, uniquePinAliases } = getPinLabels(datasheet)
  const props = [
    'name="U1"',
    `displayName={${jsxJson(datasheet.chip_name ?? "U1")}}`,
    `pinLabels={${jsxJson(pinLabels)}}`,
  ]
  if (symbolTsx) {
    props.push(`symbol={${symbolTsx}}`)
  } else if (arrangement) {
    const normalizedArrangement = { ...arrangement }
    for (const side of [
      "leftSide",
      "rightSide",
      "topSide",
      "bottomSide",
    ] as const) {
      const definition = arrangement[side]
      if (!definition) continue
      const pins = Array.isArray(definition) ? definition : definition.pins
      const normalizedPins = pins.map((pin) =>
        typeof pin === "string" && !/^(?:pin)?\d+$/.test(pin)
          ? (uniquePinAliases.get(pin) ?? aliases.get(pin) ?? pin)
          : pin,
      )
      normalizedArrangement[side] = Array.isArray(definition)
        ? normalizedPins
        : { ...definition, pins: normalizedPins }
    }
    const { width, height } = getBoxDimensions(normalizedArrangement, pinLabels)
    props.push(
      `schPinArrangement={${jsxJson(normalizedArrangement)}}`,
      `schWidth={${width}}`,
      `schHeight={${height}}`,
    )
  }
  return `export default () => <chip ${props.join(" ")} />`
}

export const hasDatasheetSchematicSymbol = (datasheet: SchematicDatasheet) =>
  Boolean(
    datasheet.symbol_tsx?.trim() ||
      datasheet.builtin_symbol_name?.trim() ||
      datasheet.sch_pin_arrangement,
  )

export const getDatasheetSchematicSvgUrl = (datasheet: SchematicDatasheet) => {
  const source = getDatasheetSchematicSource(datasheet)
  return source ? createSvgUrl(source, "schematic") : null
}
