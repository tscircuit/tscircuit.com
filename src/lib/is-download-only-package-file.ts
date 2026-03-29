export const DOWNLOAD_ONLY_PACKAGE_FILE_EXTENSIONS = new Set(["step", "stp"])

export function isDownloadOnlyPackageFile(filePath: string): boolean {
  const extension = filePath.split(".").pop()?.toLowerCase()

  if (!extension) return false

  return DOWNLOAD_ONLY_PACKAGE_FILE_EXTENSIONS.has(extension)
}
