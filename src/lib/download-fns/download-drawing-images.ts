import type { DrawingPageOutput } from "@tscircuit/drawing-viewer"
import type { CircuitJson, DrawingPage } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { convertSvgToPng } from "./convert-svg-to-png"
import { withDownloadToast } from "./download-toast"

export type DrawingImageFormat = "svg" | "png"

interface DrawingImageDownloadOptions {
  circuitJson: CircuitJson
  fileName: string
  format: DrawingImageFormat
}

const createDrawingImageFile = async ({
  renderedPage,
  drawingPages,
  fileName,
  format,
}: {
  renderedPage: DrawingPageOutput
  drawingPages: DrawingPage[]
  fileName: string
  format: DrawingImageFormat
}) => {
  const drawingPage = drawingPages.find(
    (drawingPage) => drawingPage.drawing_page_id === renderedPage.drawingPageId,
  )
  if (!drawingPage) throw new Error("A rendered drawing page was not found.")
  const blob =
    format === "png"
      ? await convertSvgToPng(renderedPage.svg)
      : new Blob([renderedPage.svg], { type: "image/svg+xml" })
  const pageName = drawingPage.name?.trim() || drawingPage.drawing_page_id
  const imageFileName = `${fileName}-${pageName}`.replace(
    /[^a-zA-Z0-9_.-]+/g,
    "-",
  )
  return {
    blob,
    fileName: `${imageFileName}.${format}`,
  }
}

export const createDrawingImageDownload = async ({
  circuitJson,
  fileName,
  format,
}: DrawingImageDownloadOptions) => {
  const drawingPages = circuitJson.filter(
    (element) => element.type === "drawing_page",
  )
  if (!drawingPages.length) {
    throw new Error("No engineering drawings are available for this circuit.")
  }
  const { renderDrawingPages } = await import("@tscircuit/drawing-viewer")
  const pages = await renderDrawingPages(circuitJson)
  if (pages.length === 1) {
    return createDrawingImageFile({
      renderedPage: pages[0],
      drawingPages,
      fileName,
      format,
    })
  }

  const zip = new JSZip()
  for (const renderedPage of pages) {
    const imageFile = await createDrawingImageFile({
      renderedPage,
      drawingPages,
      fileName,
      format,
    })
    let uniqueFileName = imageFile.fileName
    let duplicateIndex = 2
    while (zip.file(uniqueFileName)) {
      const baseName = imageFile.fileName.slice(0, -(format.length + 1))
      uniqueFileName = `${baseName}-${duplicateIndex++}.${format}`
    }
    zip.file(uniqueFileName, await imageFile.blob.arrayBuffer())
  }
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
  const zipFileName = `${fileName}-drawings-${format}.zip`.replace(
    /[^a-zA-Z0-9_.-]+/g,
    "-",
  )
  return { blob, fileName: zipFileName }
}

export const downloadDrawingImages = async (
  options: DrawingImageDownloadOptions,
) => {
  const download = await withDownloadToast(
    `Preparing engineering drawing ${options.format.toUpperCase()} download...`,
    () => createDrawingImageDownload(options),
  )
  saveAs(download.blob, download.fileName)
}
