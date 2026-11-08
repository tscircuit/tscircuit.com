import { expect, test } from "bun:test"
import { createDrawingImageDownload } from "@/lib/download-fns/download-drawing-images"
import JSZip from "jszip"
import { engineeringDrawingCircuitJson } from "./fixtures/engineering-drawings"

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
