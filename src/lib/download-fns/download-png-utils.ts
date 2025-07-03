import { AnyCircuitElement } from "circuit-json"
import { downloadCircuitPng, ImageFormat } from "./download-circuit-png"
import { toast } from "@/hooks/use-toast"

interface DownloadPngOptions {
  circuitJson?: AnyCircuitElement[] | null
  unscopedName?: string
  author?: string
  format: ImageFormat
}

export const downloadPngImage = async ({
  circuitJson,
  unscopedName,
  author,
  format,
}: DownloadPngOptions) => {
  try {
    if (author && unscopedName && !Boolean(circuitJson)) {
      // For saved packages, use the registry API
      const imageUrl = `https://registry-api.tscircuit.com/packages/images/${author}/${unscopedName}/${format}.png`
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error(`Failed to download ${format} image`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${unscopedName}_${format}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } else {
      // For unsaved packages, generate PNG from circuit JSON
      if (!circuitJson) {
        throw new Error("Circuit JSON not available")
      }
      await downloadCircuitPng(circuitJson, unscopedName || "circuit", {
        format,
      })
    }
  } catch (error: any) {
    toast({
      title: `Error Downloading ${format.charAt(0).toUpperCase() + format.slice(1)} PNG`,
      description: error.toString(),
      variant: "destructive",
    })
  }
}
