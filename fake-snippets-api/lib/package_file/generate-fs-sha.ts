import md5 from "md5"
import type { PackageFile } from "../db/schema"

/**
 * Generate an MD5 hash from package files content
 * Uses the same format as existing tests: creates a map of file_path -> content_text
 * and generates an MD5 hash of the JSON stringified map
 */
export function generateFsSha(packageFiles: PackageFile[]): string {
  const fsMap: Record<string, string> = {}

  packageFiles
    .filter((file) => file.content_text) // Only include files with content
    .forEach((file) => {
      fsMap[file.file_path] = file.content_text || ""
    })

  const hash = md5(JSON.stringify(fsMap))
  return `md5-${hash}`
}
