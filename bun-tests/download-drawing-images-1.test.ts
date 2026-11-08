import { expect, test } from "bun:test"
import { createDrawingImageDownload } from "@/lib/download-fns/download-drawing-images"
import { engineeringDrawingCircuitJson } from "./fixtures/engineering-drawings"

test.each([
  {
    drawingPageId: "carrier-inspection",
    title: "CARRIER INSPECTION",
    otherTitle: "CARRIER SECTION",
  },
  {
    drawingPageId: "carrier-section",
    title: "CARRIER SECTION",
    otherTitle: "CARRIER INSPECTION",
  },
])(
  "downloads a lone drawing directly: $drawingPageId",
  async ({ drawingPageId, title, otherTitle }) => {
    const circuitJson = engineeringDrawingCircuitJson.filter(
      (element) =>
        !("drawing_page_id" in element) ||
        element.drawing_page_id === drawingPageId,
    )
    const before = structuredClone(circuitJson)
    const download = await createDrawingImageDownload({
      circuitJson,
      fileName: "my-board",
      format: "svg",
    })
    expect(download.fileName).toBe(`my-board-${drawingPageId}.svg`)
    expect(download.blob.type).toBe("image/svg+xml")
    const svg = await download.blob.text()
    expect(svg).toContain("<svg")
    expect(svg).toContain(title)
    expect(svg).not.toContain(otherTitle)
    expect(circuitJson).toEqual(before)
  },
  20000,
)
