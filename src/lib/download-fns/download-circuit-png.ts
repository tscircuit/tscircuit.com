import { loadCircuitJsonTo3dPng } from "@/lib/utils/load-internal-dynamic-modules"
import { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonToAssemblySvg,
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToPinoutSvg,
  convertCircuitJsonToStackedSchematicSheetsSvg,
} from "circuit-to-svg"
import { saveAs } from "file-saver"
import { convertSvgToPng } from "./convert-svg-to-png"
import { withDownloadToast } from "./download-toast"

export type ImageFormat = "schematic" | "pcb" | "assembly" | "pinout" | "3d"

interface DownloadCircuitPngOptions {
  format: ImageFormat
  width?: number
  height?: number
}

// SVG-based formats are rendered to an SVG string and then rasterized to PNG.
// Anything not listed here (i.e. "3d") is rendered directly to PNG bytes.
const SVG_RENDERERS: Record<
  string,
  (circuitJson: AnyCircuitElement[], options: any) => string
> = {
  schematic: convertCircuitJsonToStackedSchematicSheetsSvg,
  pcb: convertCircuitJsonToPcbSvg,
  assembly: convertCircuitJsonToAssemblySvg,
  pinout: convertCircuitJsonToPinoutSvg,
}

const renderCircuitToPng = async (
  circuitJson: AnyCircuitElement[],
  options: DownloadCircuitPngOptions,
): Promise<Blob> => {
  const renderSvg = SVG_RENDERERS[options.format.toLowerCase()]
  if (renderSvg) {
    const svgOptions: { width?: number; height?: number } = {}
    if (options.width) svgOptions.width = options.width
    if (options.height) svgOptions.height = options.height
    return convertSvgToPng(renderSvg(circuitJson, svgOptions))
  }

  const { renderCircuitJsonTo3dPng } = await loadCircuitJsonTo3dPng()
  const pngBytes = await renderCircuitJsonTo3dPng(circuitJson, {
    cameraPreset: "top-left-corner",
    boardTextureResolution: 2048,
    width: 1920,
    height: 1440,
    supersampling: 2,
  })
  // Copy into a fresh ArrayBuffer: a Uint8Array view isn't assignable to BlobPart.
  const pngBuffer = new ArrayBuffer(pngBytes.byteLength)
  new Uint8Array(pngBuffer).set(pngBytes)
  return new Blob([pngBuffer], { type: "image/png" })
}

export const downloadCircuitPng = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
  options: DownloadCircuitPngOptions = { format: "pcb" },
) => {
  try {
    const blob = await withDownloadToast(
      `Preparing ${options.format} PNG download...`,
      () => renderCircuitToPng(circuitJson, options),
    )
    saveAs(blob, `${fileName}_${options.format}.png`)
  } catch (error) {
    console.error(error)
    throw new Error(`Failed to download ${options.format} PNG: ${error}`)
  }
}
