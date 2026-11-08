import { expect, test } from "bun:test"
import { createDrawingImageDownload } from "@/lib/download-fns/download-drawing-images"
import JSZip from "jszip"
import { engineeringDrawingCircuitJson } from "./fixtures/engineering-drawings"

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
