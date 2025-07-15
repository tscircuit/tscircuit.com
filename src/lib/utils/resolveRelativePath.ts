/**
 * Resolves a relative file path to an absolute path based on the current file
 */
export const resolveRelativePath = (
  relativePath: string,
  currentFilePath: string,
): string => {
  if (!currentFilePath) return relativePath

  const currentDir = currentFilePath.includes("/")
    ? currentFilePath.substring(0, currentFilePath.lastIndexOf("/"))
    : ""

  if (relativePath.startsWith("./")) {
    return currentDir
      ? `${currentDir}/${relativePath.slice(2)}`
      : relativePath.slice(2)
  }

  if (relativePath.startsWith("../")) {
    const parts = currentDir.split("/").filter((p) => p !== "")
    const relativeParts = relativePath.split("/").filter((p) => p !== "")

    let upCount = 0
    for (const part of relativeParts) {
      if (part === "..") {
        upCount++
      } else {
        break
      }
    }

    const resultParts = parts.slice(0, Math.max(0, parts.length - upCount))
    const remainingParts = relativeParts.slice(upCount)

    return [...resultParts, ...remainingParts].join("/")
  }

  return relativePath
}
