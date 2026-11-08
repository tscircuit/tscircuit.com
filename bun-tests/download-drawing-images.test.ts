import { expect, test } from "bun:test"
import { createDrawingImageDownload } from "@/lib/download-fns/download-drawing-images"
import JSZip from "jszip"
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

test("automatically packages multiple drawings into a ZIP", async () => {
  const download = await createDrawingImageDownload({
    circuitJson: engineeringDrawingCircuitJson,
    fileName: "my-board",
    format: "svg",
  })
  expect(download.fileName).toBe("my-board-drawings-svg.zip")
  expect(download.blob.type).toBe("application/zip")
  const zip = await JSZip.loadAsync(await download.blob.arrayBuffer())
  expect(Object.keys(zip.files).sort()).toEqual([
    "my-board-carrier-inspection.svg",
    "my-board-carrier-section.svg",
  ])
  expect(
    await zip.file("my-board-carrier-inspection.svg")!.async("string"),
  ).toContain("CARRIER INSPECTION")
  expect(
    await zip.file("my-board-carrier-section.svg")!.async("string"),
  ).toContain("CARRIER SECTION")
}, 20000)

test("retains every drawing when sanitized filenames collide", async () => {
  const circuitJson = engineeringDrawingCircuitJson.map((element) =>
    element.type === "drawing_page"
      ? {
          ...element,
          name:
            element.name === "carrier-inspection" ? "same/name" : "same name",
        }
      : element,
  )
  const download = await createDrawingImageDownload({
    circuitJson,
    fileName: "my/board",
    format: "svg",
  })
  const zip = await JSZip.loadAsync(await download.blob.arrayBuffer())
  expect(Object.keys(zip.files).sort()).toEqual([
    "my-board-same-name-2.svg",
    "my-board-same-name.svg",
  ])
  expect(await zip.file("my-board-same-name.svg")!.async("string")).toContain(
    "CARRIER INSPECTION",
  )
  expect(await zip.file("my-board-same-name-2.svg")!.async("string")).toContain(
    "CARRIER SECTION",
  )
}, 20000)

test.each(["svg", "png"] as const)(
  "rejects an empty %s drawing download",
  async (format) => {
    await expect(
      createDrawingImageDownload({
        circuitJson: [],
        fileName: "my-board",
        format,
      }),
    ).rejects.toThrow("No engineering drawings")
  },
)
