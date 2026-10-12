import { describe, test, expect } from "bun:test"
import ts from "typescript"
import {
  abbreviateComponentTsx,
  getDatasheetComponentTsx,
} from "@/lib/datasheet-component-tsx"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"

const data = {
  chip_name: "EXAMPLE",
  footprinter_string: "sot23",
  pin_information: [
    { pin_number: "1", name: ["VIN"], description: "", capabilities: [] },
  ],
  pin_attributes: { pin1: { requiresPower: true, requiresVoltage: "3.3V" } },
  sch_pin_arrangement: { leftSide: ["pin1"] },
} as unknown as DatasheetWithPinAttributes

const checkSyntax = (source: string) => {
  const file = ts.createSourceFile(
    "component.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  expect(
    (file as unknown as { parseDiagnostics: unknown[] }).parseDiagnostics,
  ).toHaveLength(0)
}

describe("datasheet component TSX", () => {
  test("uses API supplier numbers in the copied component and preserves other supplier properties", () => {
    const source = getDatasheetComponentTsx({
      ...data,
      jlc_part_number: "C54321",
      digikey_part_number: null,
      mouser_part_number: "123-NEW",
      generated_tsx:
        'export default () => <chip supplierPartNumbers={{other:["OTHER"],jlcpcb:["OLD"]}} />',
    })!
    checkSyntax(source)
    expect(source).toContain('other:["OTHER"]')
    expect(source).toContain('"jlcpcb":["C54321"]')
    expect(source).toContain('"digikey":[]')
    expect(source).toContain('"mouser":["123-NEW"]')
    expect(abbreviateComponentTsx(source)).toContain(
      "supplierPartNumbers={...}",
    )
  })
  test("combines current footprint, symbol and electrical data with the published component", () => {
    const source = getDatasheetComponentTsx({
      ...data,
      generated_tsx:
        'import type { ChipProps } from "tscircuit"\nexport const EXAMPLE = (props: ChipProps) => <chip name="U1" footprint="old" pinAttributes={{pin1: {requiresVoltage: 1}}} supplierPartNumbers={{jlcpcb:["C123"]}} {...props} />',
    })!
    checkSyntax(source)
    expect(source).toContain("export const EXAMPLE")
    expect(source).toContain('footprint={"sot23"}')
    expect(source).toContain('"requiresPower":true')
    expect(source).toContain('"requiresVoltage":"3.3V"')
    expect(source).not.toContain("requiresVoltage: 1")
    expect(source).toContain("schPinArrangement=")
    expect(source).toContain('supplierPartNumbers={{jlcpcb:["C123"]}}')
    expect(source.indexOf("schPinArrangement=")).toBeLessThan(
      source.indexOf("{...props}"),
    )
  })

  test("abbreviates visible object data without changing complete source", () => {
    const source = getDatasheetComponentTsx({
      ...data,
      generated_tsx:
        'const labels = {pin1:["VIN"]} as const; export default () => <chip pinLabels={labels} />',
    })!
    const display = abbreviateComponentTsx(source)
    expect(display).toContain("pinAttributes={...}")
    expect(display).toContain("pinLabels={...}")
    expect(display).toContain("schPinArrangement={...}")
    expect(display).toContain("const labels = ...")
    expect(display).not.toContain("3.3V")
    expect(source).toContain('"requiresVoltage":"3.3V"')
    checkSyntax(source)
  })

  test("builds a component when structured metadata has no published TSX", () => {
    const source = getDatasheetComponentTsx(data)!
    checkSyntax(source)
    expect(source).toContain('footprint={"sot23"}')
    expect(source).toContain("schPinArrangement=")
    expect(source).toContain("pinAttributes=")
  })

  test("retains custom symbol expressions and represents builtin symbols alongside the footprint", () => {
    const custom = getDatasheetComponentTsx({
      ...data,
      symbol_tsx: '<symbol><path d="M0 0 L1 1" /></symbol>',
    })!
    expect(custom).toContain("symbol={<symbol>")
    expect(custom).not.toContain("schPinArrangement=")
    checkSyntax(custom)
    const builtin = getDatasheetComponentTsx({
      ...data,
      builtin_symbol_name: "diode",
    })!
    expect(builtin).toContain('footprint={"sot23"}')
    expect(builtin).toContain("noSchematicRepresentation")
    expect(builtin).toContain('<schematicsymbol name="A"')
    expect(builtin).toContain('symbolName={"diode"}')
    checkSyntax(builtin)
  })

  test("quotes metadata as literals and leaves non-chip published modules intact", () => {
    const source = getDatasheetComponentTsx({
      ...data,
      footprinter_string: 'sot23"} /><chip name="INJECTED" />',
    })!
    checkSyntax(source)
    expect(source).toContain("\\u003cchip")
    const published =
      'export default () => <resistor name="R1" resistance="1k" />'
    expect(
      getDatasheetComponentTsx({ ...data, generated_tsx: published }),
    ).toBe(published)
    expect(
      getDatasheetComponentTsx({
        chip_name: "EMPTY",
      } as DatasheetWithPinAttributes),
    ).toBeNull()
  })
})
