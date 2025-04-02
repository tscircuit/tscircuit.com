/**
 * Checks if a given file path is within a specified directory
 * @param params.dir Current directory path
 * @param params.path File or directory path to check
 * @returns True if the path is within the specified directory
 */
export function isWithinDirectory({
  dir,
  path,
}: { dir: string; path: string }): boolean {
  if (path.startsWith("/")) {
    path = path.substring(1)
  }

  // If directory is empty, we're at the root, so show all top-level items
  if (!dir) {
    // Check if this is a top-level path (no directory separators or just one at the beginning)
    return !path.includes("/")
  }

  // Skip the current directory
  if (path === dir) {
    return false
  }

  // For non-root directories, find direct children
  // Path must start with the dir + / and not have additional directory separators
  return (
    path.startsWith(dir + "/") &&
    path.substring(dir.length + 1).split("/").length === 1
  )
}
