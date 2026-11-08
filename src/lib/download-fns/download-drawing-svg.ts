import type { CircuitJson, DrawingPage } from "circuit-json"
import { saveAs } from "file-saver"
import JSZip from "jszip"
import { withDownloadToast } from "./download-toast"

export const getDrawingSvgFileName = ({
  drawingPage,
  fileName,
}: {
  drawingPage: DrawingPage
  fileName: string
}) => {
  const pageName = drawingPage.name?.trim() || drawingPage.drawing_page_id
  return `${fileName}-${pageName}`.replace(/[^a-zA-Z0-9_.-]+/g, "-") + ".svg"
}

export const createDrawingSvg = async ({
  circuitJson,
  drawingPageId,
}: {
  circuitJson: CircuitJson
  drawingPageId: string
}) => {
  const { renderDrawingPages } = await import("@tscircuit/drawing-viewer")
  const [page] = await renderDrawingPages(circuitJson, { drawingPageId })
  if (!page) throw new Error("The selected engineering drawing was not found.")
  return new Blob([page.svg], { type: "image/svg+xml" })
}

export const downloadDrawingSvg = async ({
  circuitJson,
  drawingPageId,
  fileName,
}: {
  circuitJson: CircuitJson
  drawingPageId: string
  fileName: string
}) => {
  const drawingPage = circuitJson
    .filter((element) => element.type === "drawing_page")
    .find((page) => page.drawing_page_id === drawingPageId)
  if (!drawingPage)
    throw new Error("The selected engineering drawing was not found.")
  const content = await withDownloadToast("Preparing drawing download...", () =>
    createDrawingSvg({ circuitJson, drawingPageId }),
  )
  saveAs(content, getDrawingSvgFileName({ drawingPage, fileName }))
}

export const createDrawingsZip = async ({
  circuitJson,
  fileName,
}: {
  circuitJson: CircuitJson
  fileName: string
}) => {
  const drawingPages = circuitJson.filter(
    (element) => element.type === "drawing_page",
  )
  if (!drawingPages.length) {
    throw new Error("No engineering drawings are available for this circuit.")
  }
  const { renderDrawingPages } = await import("@tscircuit/drawing-viewer")
  const pages = await renderDrawingPages(circuitJson)
  const zip = new JSZip()
  for (const page of pages) {
    const drawingPage = drawingPages.find(
      (drawingPage) => drawingPage.drawing_page_id === page.drawingPageId,
    )
    if (!drawingPage) throw new Error("A rendered drawing page was not found.")
    const svgFileName = getDrawingSvgFileName({ drawingPage, fileName })
    let uniqueFileName = svgFileName
    let duplicateIndex = 2
    while (zip.file(uniqueFileName)) {
      uniqueFileName = `${svgFileName.slice(0, -4)}-${duplicateIndex++}.svg`
    }
    zip.file(uniqueFileName, page.svg)
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" })
}

export const downloadAllDrawingSvgs = async ({
  circuitJson,
  fileName,
}: {
  circuitJson: CircuitJson
  fileName: string
}) => {
  const content = await withDownloadToast(
    "Preparing all drawing downloads...",
    () => createDrawingsZip({ circuitJson, fileName }),
  )
  const zipFileName = `${fileName}-drawings.zip`.replace(
    /[^a-zA-Z0-9_.-]+/g,
    "-",
  )
  saveAs(content, zipFileName)
}
