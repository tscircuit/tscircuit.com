import { decodeUrlHashToText } from "./decodeUrlHashToText"

export function decodeUrlHashToFsMap(
  url: string,
): Record<string, string> | null {
  let text
  try {
    text = decodeUrlHashToText(url)
  } catch {
    return null
  }
  if (!text) return null
  try {
    const files = JSON.parse(text)
    if (
      files &&
      typeof files === "object" &&
      !Array.isArray(files) &&
      Object.keys(files).length &&
      Object.values(files).every((value) => typeof value === "string")
    ) {
      return files
    }
  } catch {
    // Older shared editor links contain the source of a single file.
    return { "index.tsx": text }
  }
  return null
}
