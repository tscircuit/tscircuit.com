import { gunzipSync, strFromU8 } from "fflate"
import { base64ToBytes } from "./base64ToBytes"

export function decodeUrlHashToFsMap(
  url: string,
): Record<string, string> | null {
  const base64Data = url.split("#data:application/gzip;base64,")[1]
  if (!base64Data) return null
  try {
    const compressedData = base64ToBytes(base64Data)
    const decompressedData = gunzipSync(compressedData)
    const text = strFromU8(decompressedData)
    return JSON.parse(text)
  } catch {
    return null
  }
}
