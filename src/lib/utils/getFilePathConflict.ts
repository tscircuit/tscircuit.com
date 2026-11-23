// The file tree shows "/index.tsx" and "index.tsx" as the same entry.
const withoutLeadingSlash = (filePath: string) => filePath.replace(/^\//, "")

/**
 * Why a new file can't be created at filePath, or null when it can. A path is
 * either a file or a folder, so "lib" can't sit beside "lib/resistor.tsx".
 */
export const getFilePathConflict = (
  filePath: string,
  existingFilePaths: string[],
): string | null => {
  const newPath = withoutLeadingSlash(filePath)
  for (const existingFilePath of existingFilePaths) {
    const existingPath = withoutLeadingSlash(existingFilePath)
    if (existingPath === newPath) {
      return `File '${existingFilePath}' already exists`
    }
    if (existingPath.startsWith(`${newPath}/`)) {
      return `A folder named '${newPath}' already exists`
    }
    if (newPath.startsWith(`${existingPath}/`)) {
      return `'${existingFilePath}' is a file, so it can't contain '${filePath}'`
    }
  }
  return null
}
