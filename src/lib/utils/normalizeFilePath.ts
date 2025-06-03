export const normalizeFilePath = (rawPath: string) => {
  let normalizedPath = rawPath.trim() // Remove leading/trailing whitespace
  normalizedPath = normalizedPath.replace(/\/+/g, "/") // Replace multiple consecutive slashes with a single slash
  normalizedPath = normalizedPath.replace(/^\.\//, "") // Remove leading "./"
  normalizedPath = normalizedPath.replace(/\/$/, "") // Remove trailing slash
  normalizedPath = normalizedPath.replace(/\\/g, "/") // Replace backslashes with forward slashes
  normalizedPath = normalizedPath.replace(/^\//, "") // Remove leading "/"

  return normalizedPath
}
