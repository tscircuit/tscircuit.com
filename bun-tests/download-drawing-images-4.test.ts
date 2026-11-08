import { expect, test } from "bun:test"
import { createDrawingImageDownload } from "@/lib/download-fns/download-drawing-images"

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
