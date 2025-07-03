import { gzipSync, strToU8 } from "fflate"
import { bytesToBase64 } from "./bytesToBase64"

export function encodeFsMapToUrlHash(
  fsMap: Record<string, string>,
  snippet_type?: string,
): string {
  const text = JSON.stringify(fsMap)
  const compressedData = gzipSync(strToU8(text))
  const base64Data = bytesToBase64(compressedData)
  const typeParam = snippet_type ? `&snippet_type=${snippet_type}` : ""
  return `${window.location.origin}/editor?${typeParam}#data:application/gzip;base64,${base64Data}`
}
