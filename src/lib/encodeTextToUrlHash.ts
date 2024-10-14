import { gzipSync, strToU8 } from "fflate"
import { bytesToBase64 } from "./bytesToBase64"

export function encodeTextToUrlHash(text: string): string {
  // Compress the input string
  const compressedData = gzipSync(strToU8(text))

  // Convert to base64
  const base64Data = bytesToBase64(compressedData)

  // Construct the URL
  return `${window.location.origin}/editor#data:application/gzip;base64,${base64Data}`
}
