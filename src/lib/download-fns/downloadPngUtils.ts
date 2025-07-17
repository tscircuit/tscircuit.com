import { toast } from "@/hooks/useToast"
import type { AnyCircuitElement } from "circuit-json"
import { type ImageFormat, downloadCircuitPng } from "./download-circuit-png"

interface DownloadPngOptions {
  circuitJson?: AnyCircuitElement[] | null
  unscopedName?: string
  author?: string
  format: ImageFormat
}

export const downloadPngImage = async ({
  circuitJson,
  unscopedName,
  format,
}: DownloadPngOptions) => {
  try {
    if (!circuitJson) {
      throw new Error("Circuit JSON not available")
    }
    await downloadCircuitPng(circuitJson, unscopedName || "circuit", {
      format,
    })
  } catch (error: any) {
    toast({
      title: `Error Downloading ${format.charAt(0).toUpperCase() + format.slice(1)} PNG`,
      description: error.toString(),
      variant: "destructive",
    })
  }
}
