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

    // Clean up the object URL after a timeout to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  })
}

const get3dImageFromUrl = async (
  circuitJson: AnyCircuitElement[],
): Promise<Blob> => {
  try {
    const { getCompressedBase64SnippetString } = await import(
      "@tscircuit/create-snippet-url"
    )

    // Create a temporary snippet code for 3D rendering
    const snippetCode = `
import { Circuit } from "@tscircuit/core"

export default () => {
  const circuit = new Circuit()
  // Note: This is a simplified approach for 3D rendering of circuit JSON
  // In production, you would recreate the circuit from the JSON
  return <board width="10mm" height="10mm" />
}
`

    const compressedCode = getCompressedBase64SnippetString(snippetCode)
    const urlPrefix = "https://png.tscircuit.com"
    const threeDPreviewUrl = `${urlPrefix}?code=${encodeURIComponent(compressedCode)}`

    const response = await fetch(threeDPreviewUrl, {
      timeout: 10000, // 10 second timeout
      headers: {
        Accept: "image/png, image/*, */*",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch 3D image: ${response.statusText}`)
    }

    return await response.blob()
  } catch (error) {
    // Fallback: create a simple placeholder PNG
    const canvas = document.createElement("canvas")
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Create a simple 3D placeholder
      ctx.fillStyle = "#f0f0f0"
      ctx.fillRect(0, 0, 800, 600)
      ctx.fillStyle = "#666"
      ctx.font = "24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("3D Preview Not Available", 400, 280)
      ctx.fillText("Circuit JSON contains:", 400, 320)
      ctx.fillText(`${circuitJson.length} elements`, 400, 360)

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob || new Blob())
        }, "image/png")
      })
    }

    throw new Error(`3D image generation failed: ${error}`)
  }
}

export const downloadCircuitPng = async (
  circuitJson: AnyCircuitElement[],
  fileName: string,
  options: DownloadCircuitPngOptions = { format: "pcb" },
) => {
  try {
    let blob: Blob

    if (options.format === "3d") {
      blob = await get3dImageFromUrl(circuitJson)
    } else {
      let svg: string

      const svgOptions: any = {}
      if (options.width) svgOptions.width = options.width
      if (options.height) svgOptions.height = options.height

      switch (options.format) {
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
          throw new Error(`Unsupported format: ${options.format}`)
      }

      blob = await convertSvgToPng(svg)
    }

    const downloadFileName = `${fileName}_${options.format}.png`
    saveAs(blob, downloadFileName)
  } catch (error) {
    throw new Error(`Failed to download ${options.format} PNG: ${error}`)
  }
}
