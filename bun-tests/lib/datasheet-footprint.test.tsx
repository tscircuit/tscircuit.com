import { describe, expect, test } from "bun:test"
import { getUncompressedSnippetString } from "@tscircuit/create-snippet-url"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"
import { DatasheetFootprint } from "@/components/DatasheetFootprint"
import { getDatasheetFootprintSvgUrl } from "@/lib/datasheet-footprint"

describe("datasheet footprint", () => {
  test("uses the stored footprint as a string literal in a PCB SVG request", () => {
    const footprint = "qfn64_w9_h9_p0.5_thermalpad"
    const url = new URL(getDatasheetFootprintSvgUrl(footprint))
    expect(url.origin).toBe("https://svg.tscircuit.com")
    expect(url.searchParams.get("svg_type")).toBe("pcb")
    expect(url.searchParams.get("show_solder_mask")).toBe("0")
    expect(getUncompressedSnippetString(url.searchParams.get("code")!)).toBe(
      `export default () => <chip name="U1" footprint={${JSON.stringify(footprint)}} />`,
    )
  })

  test("quotes and JSX syntax in metadata cannot become executable code", () => {
    const footprint = 'qfn"} /><chip name="INJECTED" /> {/*\\\n\u2028'
    const url = new URL(getDatasheetFootprintSvgUrl(footprint))
    const snippet = getUncompressedSnippetString(url.searchParams.get("code")!)
    const source = ts.createSourceFile(
      "preview.tsx",
      snippet,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const jsxNodes: ts.JsxSelfClosingElement[] = []
    const inspect = (node: ts.Node) => {
      if (ts.isJsxSelfClosingElement(node)) jsxNodes.push(node)
      ts.forEachChild(node, inspect)
    }
    inspect(source)
    expect(jsxNodes).toHaveLength(1)
    const attribute = jsxNodes[0].attributes.properties[1] as ts.JsxAttribute
    const expression = (attribute.initializer as ts.JsxExpression).expression!
    expect(ts.isStringLiteral(expression)).toBe(true)
    expect((expression as ts.StringLiteral).text).toBe(footprint)
  })

  test("omits the section for missing, null, and blank footprint metadata", () => {
    for (const footprinterString of [undefined, null, "", " \n "]) {
      expect(
        renderToStaticMarkup(
          <DatasheetFootprint
            chipName="F1C100S"
            footprinterString={footprinterString}
          />,
        ),
      ).toBe("")
    }
  })

  test("shows chip usage, an accessible preview, and loading state", () => {
    const html = renderToStaticMarkup(
      <DatasheetFootprint
        chipName="F1C100S"
        footprinterString="qfn64_w9_h9_p0.5"
      />,
    )
    expect(html).not.toContain("Footprinter string")
    expect(html).toContain(
      "<code>&lt;chip\n  footprint=&quot;qfn64_w9_h9_p0.5&quot;\n  {/* ... */}\n/&gt;</code>",
    )
    expect(html).toContain('alt="F1C100S PCB footprint"')
    expect(html).toContain('role="status"')
    expect(html).not.toContain('loading="lazy"')
  })
})
