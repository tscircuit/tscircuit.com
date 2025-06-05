import { AnyCircuitElement } from "circuit-json"
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

  let svg = convertCircuitJsonToPcbSvg(circuitJson, convertOptions)

  if (options.backgroundColor) {
    svg = svg.replace(
      /(class="boundary"[^>]*fill=")#[^"]*(")/,
      `$1${options.backgroundColor}$2`,
    )
  }

  if (options.drawPaddingOutsideBoard === false) {
    svg = svg.replace(/<rect[^>]*class="boundary"[^>]*\/?>/, "")
    svg = svg.replace(/<rect[^>]*class="pcb-boundary"[^>]*\/?>/, "")
  }

  const blob = new Blob([svg], { type: "image/svg+xml" })
  saveAs(blob, fileName + ".svg")
}
