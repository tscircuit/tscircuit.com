/**
 * Why a new file can't be created at filePath, or null when it can. A path is
 * either a file or a folder, so "lib" can't sit beside "lib/resistor.tsx".
 */
export const getFilePathConflict = (
  filePath: string,
  existingFilePaths: string[],
): string | null => {
  for (const existingFilePath of existingFilePaths) {
    if (existingFilePath === filePath) {
      return `File '${filePath}' already exists`
    }
    if (existingFilePath.startsWith(`${filePath}/`)) {
      return `A folder named '${filePath}' already exists`
    }
    if (filePath.startsWith(`${existingFilePath}/`)) {
      return `'${existingFilePath}' is a file, so it can't contain '${filePath}'`
    }
  }
  return null
}
