import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { saveAs } from "file-saver"

export interface DownloadPcbSvgOptions {
  layer?: "all" | "top" | "bottom"
  drawPaddingOutsideBoard?: boolean
  backgroundColor?: string
  matchAspectRatio?: boolean
}

export const downloadPcbSvg = (
  circuitJson: AnyCircuitElement[],
  fileName: string,
  options: DownloadPcbSvgOptions = {},
) => {
  const convertOptions: any = {}
  if (options.layer && options.layer !== "all") {
    convertOptions.layer = options.layer
  }
  if (options.matchAspectRatio) {
    convertOptions.matchBoardAspectRatio = true
  }
  if (typeof options.drawPaddingOutsideBoard === "boolean") {
    convertOptions.drawPaddingOutsideBoard = options.drawPaddingOutsideBoard
  }
  if (options.backgroundColor) {
    convertOptions.backgroundColor = options.backgroundColor
  }

  const svg = convertCircuitJsonToPcbSvg(circuitJson, convertOptions)

  const blob = new Blob([svg], { type: "image/svg+xml" })
  saveAs(blob, `${fileName}.svg`)
}
