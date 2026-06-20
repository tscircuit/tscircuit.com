import { AnyCircuitElement } from "circuit-json"
import { renderCircuitJsonTo3dPng } from "circuit-json-to-3d-png"
import {
  convertCircuitJsonToAssemblySvg,
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToPinoutSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { saveAs } from "file-saver"

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
  schematic: convertCircuitJsonToSchematicSvg,
  pcb: convertCircuitJsonToPcbSvg,
  assembly: convertCircuitJsonToAssemblySvg,
  pinout: convertCircuitJsonToPinoutSvg,
}

const convertSvgToPng = async (svgString: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width || 800
      canvas.height = img.height || 600
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert canvas to blob"))
        }
      }, "image/png")
    }

    img.onerror = () => {
      reject(new Error("Failed to load SVG image"))
    }

    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)
    img.src = url

    setTimeout(() => URL.revokeObjectURL(url), 10000)
  })
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

  const pngBytes = await renderCircuitJsonTo3dPng(circuitJson, {
    cameraPreset: "top-left-corner",
    boardTextureResolution: 2048,
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
    const blob = await renderCircuitToPng(circuitJson, options)
    saveAs(blob, `${fileName}_${options.format}.png`)
  } catch (error) {
    console.error(error)
    throw new Error(`Failed to download ${options.format} PNG: ${error}`)
  }
}
