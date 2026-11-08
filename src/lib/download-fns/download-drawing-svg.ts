import type { CircuitJson, DrawingPage } from "circuit-json"
import { saveAs } from "file-saver"
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
