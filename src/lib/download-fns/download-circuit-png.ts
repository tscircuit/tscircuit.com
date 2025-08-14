import { convertCircuitJsonToSimple3dSvg } from "circuit-json-to-simple-3d"
import { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonToAssemblySvg,
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { saveAs } from "file-saver"

export type ImageFormat = "schematic" | "pcb" | "assembly" | "3d"

interface DownloadCircuitPngOptions {
  format: ImageFormat
  width?: number
  height?: number
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

export const downloadCircuitPng = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
  options: DownloadCircuitPngOptions = { format: "pcb" },
) => {
  try {
    let blob: Blob
    let svg: string

    const svgOptions: any = {}
    if (options.width) svgOptions.width = options.width
    if (options.height) svgOptions.height = options.height

    switch (options.format.toLowerCase()) {
      case "schematic":
        svg = convertCircuitJsonToSchematicSvg(circuitJson, svgOptions)
        break
      case "pcb":
        svg = convertCircuitJsonToPcbSvg(circuitJson, svgOptions)
        break
      case "assembly":
        svg = convertCircuitJsonToAssemblySvg(circuitJson, svgOptions)
        break
      default:
        svg = await convertCircuitJsonToSimple3dSvg(circuitJson, {
          background: {
            color: "#fff",
            opacity: 0.0,
          },
          defaultZoomMultiplier: 1.1,
        })
    }

    blob = await convertSvgToPng(svg)
    const downloadFileName = `${fileName}_${options.format}.png`
    saveAs(blob, downloadFileName)
  } catch (error) {
    console.error(error)
    throw new Error(`Failed to download ${options.format} PNG: ${error}`)
  }
}
