import { describe, expect, test } from "bun:test"
import { getUncompressedSnippetString } from "@tscircuit/create-snippet-url"
import ts from "typescript"
import type { DatasheetPin } from "@/lib/datasheet-pin-display"
import {
  getDatasheetSchematicSource,
  getDatasheetSchematicSvgUrl,
  hasDatasheetSchematicSymbol,
} from "@/lib/datasheet-schematic-symbol"

const pin = (pin_number: string, name: string | string[]): DatasheetPin => ({
  pin_number,
  name,
  description: "",
  capabilities: [],
})

describe("datasheet schematic source", () => {
  test("omits previews when no schematic metadata is available", () => {
    for (const datasheet of [
      {},
      {
        sch_pin_arrangement: null,
        symbol_tsx: null,
        builtin_symbol_name: null,
      },
      { symbol_tsx: " \n ", builtin_symbol_name: " " },
    ]) {
      expect(hasDatasheetSchematicSymbol(datasheet)).toBe(false)
      expect(getDatasheetSchematicSource(datasheet)).toBeNull()
      expect(getDatasheetSchematicSvgUrl(datasheet)).toBeNull()
    }
  })

  test("requests a schematic SVG using physical pins and primary labels", () => {
    const datasheet = {
      chip_name: "RP2040",
      pin_information: [
        pin("1", ["IOVDD"]),
        pin("2", ["GPIO0", "SPI0_RX", "UART0_TX"]),
        pin("57", "GND"),
      ],
      sch_pin_arrangement: {
        leftSide: [2],
        topSide: { pins: ["pin1"], direction: "left-to-right" as const },
        bottomSide: [57],
      },
    }
    const url = new URL(getDatasheetSchematicSvgUrl(datasheet)!)
    expect(url.origin).toBe("https://svg.tscircuit.com")
    expect(url.searchParams.get("svg_type")).toBe("schematic")
    const source = getUncompressedSnippetString(url.searchParams.get("code")!)
    expect(source).toBe(getDatasheetSchematicSource(datasheet)!)
    expect(source).toContain(
      'pinLabels={{"pin1":["IOVDD"],"pin2":["GPIO0"],"pin57":["GND"]}}',
    )
    expect(source).toContain(
      'schPinArrangement={{"leftSide":[2],"topSide":{"pins":["pin1"],"direction":"left-to-right"},"bottomSide":[57]}}',
    )
    expect(source).not.toContain("SPI0_RX")
    expect(source).not.toContain("footprint=")
    expect(source).not.toContain("pinAttributes=")
    expect(hasDatasheetSchematicSymbol(datasheet)).toBe(true)
  })

  test("uses custom JSX expressions before builtins and arrangements", () => {
    const symbol =
      '<symbol><schematicrect width={2} height={2} /><port name="pin1" schX={-1} schY={0} /></symbol>'
    const source = getDatasheetSchematicSource({
      symbol_tsx: symbol,
      builtin_symbol_name: "diode_right",
      sch_pin_arrangement: { leftSide: [1] },
      pin_information: [pin("1", "K")],
    })!
    expect(source).toContain(`symbol={${symbol}}`)
    expect(source).not.toContain("symbolName=")
    expect(source).not.toContain("schPinArrangement=")
  })

  test("custom symbols keep named ports without automatic numeric chip labels", () => {
    const symbol =
      '<symbol><port name="A1" schX={-1} schY={0} direction="left" /></symbol>'
    const datasheet = {
      chip_name: "BQ25101YFPR",
      symbol_tsx: symbol,
      pin_information: [pin("A1", "OUT"), pin("A2", "IN")],
    }
    const source = getDatasheetSchematicSource(datasheet)!
    expect(source).toBe(
      `export default () => <chip name="U1" displayName={"BQ25101YFPR"} symbol={${symbol}} />`,
    )
    const url = new URL(getDatasheetSchematicSvgUrl(datasheet)!)
    expect(getUncompressedSnippetString(url.searchParams.get("code")!)).toBe(
      source,
    )
  })

  test("renders builtins with the core schematic primitive", () => {
    const source = getDatasheetSchematicSource({
      chip_name: "1N4148",
      symbol_tsx: " ",
      builtin_symbol_name: " diode_right ",
      sch_pin_arrangement: { leftSide: [1], rightSide: [2] },
    })!
    expect(source).toBe(
      'export default () => <schematicsymbol name="U1" displayName={"1N4148"} symbolName={"diode_right"} />',
    )
  })

  test("sizes large boxes to separate rail names from signal labels", () => {
    const pin_information = Array.from({ length: 57 }, (_, index) =>
      pin(String(index + 1), index < 11 ? "IOVDD" : "GPIO29"),
    )
    const source = getDatasheetSchematicSource({
      pin_information,
      sch_pin_arrangement: {
        leftSide: Array.from({ length: 15 }, (_, index) => index + 12),
        rightSide: Array.from({ length: 30 }, (_, index) => index + 27),
        topSide: Array.from({ length: 11 }, (_, index) => index + 1),
        bottomSide: [57],
      },
    })!
    expect(source).toContain("schWidth={4.96}")
    expect(source).toContain("schHeight={6.6}")
    const legacy = getDatasheetSchematicSource({
      pin_information,
      sch_pin_arrangement: { leftPinCount: 29, rightSize: 28 },
    })!
    expect(legacy).toContain(
      'schPinArrangement={{"leftPinCount":29,"rightSize":28}}',
    )
    expect(legacy).toContain("schHeight={6.4}")
  })

  test("translates punctuation and reserves physical-pin selectors", () => {
    const source = getDatasheetSchematicSource({
      pin_information: [pin("1", "IN+"), pin("2", "IN_PLUS"), pin("3", "pin2")],
      sch_pin_arrangement: { leftSide: ["IN+", "IN_PLUS", "pin3"] },
    })!
    expect(source).toContain(
      'pinLabels={{"pin1":["IN_PLUS_alias"],"pin2":["IN_PLUS"],"pin3":["label_pin2"]}}',
    )
    expect(source).toContain(
      'schPinArrangement={{"leftSide":["pin1","pin2","pin3"]}}',
    )
  })

  test("resolves unique alternate aliases without adding mux labels to the symbol", () => {
    const source = getDatasheetSchematicSource({
      pin_information: [
        pin("1", ["GPIO0", "SPI0_RX", "UART0_TX"]),
        pin("2", ["GPIO1", "SPI0_CSn", "UART0_RX"]),
        pin("3", "GND"),
      ],
      sch_pin_arrangement: {
        leftSide: ["SPI0_RX"],
        rightSide: { pins: ["UART0_RX"], direction: "top-to-bottom" },
        bottomSide: ["GND"],
      },
    })!
    expect(source).toContain(
      'pinLabels={{"pin1":["GPIO0"],"pin2":["GPIO1"],"pin3":["GND"]}}',
    )
    expect(source).toContain(
      'schPinArrangement={{"leftSide":["pin1"],"rightSide":{"pins":["pin2"],"direction":"top-to-bottom"},"bottomSide":["pin3"]}}',
    )
    expect(source).not.toContain("SPI0_RX")
    expect(source).not.toContain("UART0_RX")
  })

  test("keeps shared aliases rather than selecting an arbitrary physical pin", () => {
    const source = getDatasheetSchematicSource({
      pin_information: [
        pin("1", ["IOVDD", "SUPPLY"]),
        pin("2", ["IOVDD", "SUPPLY"]),
      ],
      sch_pin_arrangement: { topSide: ["IOVDD"], leftSide: ["SUPPLY"] },
    })!
    expect(source).toContain('pinLabels={{"pin1":["IOVDD"],"pin2":["IOVDD"]}}')
    expect(source).toContain(
      'schPinArrangement={{"topSide":["IOVDD"],"leftSide":["SUPPLY"]}}',
    )
  })

  test("quotes and JSX in data stay literals rather than executable source", () => {
    const chipName = 'U1"} /><chip name="INJECTED" /> {/*\n\u2028'
    const source = getDatasheetSchematicSource({
      chip_name: chipName,
      builtin_symbol_name: 'diode_right"} /><chip name="INJECTED" /> {/*',
    })!
    const parsed = ts.createSourceFile(
      "preview.tsx",
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const jsxNodes: ts.JsxSelfClosingElement[] = []
    const inspect = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node)) jsxNodes.push(node)
      ts.forEachChild(node, inspect)
    }
    inspect(parsed)
    expect(jsxNodes).toHaveLength(1)
    const displayName = jsxNodes[0].attributes.properties[1] as ts.JsxAttribute
    const expression = (displayName.initializer as ts.JsxExpression).expression!
    expect(ts.isStringLiteral(expression)).toBe(true)
    expect((expression as ts.StringLiteral).text).toBe(chipName)
  })
})
