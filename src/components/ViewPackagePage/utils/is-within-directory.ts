/**
 * Checks if a given file path is within a specified directory
 * @param params.dir Current directory path
 * @param params.path File or directory path to check
 * @returns True if the path is within the specified directory
 */
export function isWithinDirectory({ dir, path }: { dir: string; path: string }): boolean {
  // If directory is empty, we're at the root, so show all top-level items
  if (!dir) {
    // Check that path doesn't contain any directory separators
    // or only contains one at the beginning
    return !path.includes("/") || path.indexOf("/") === path.lastIndexOf("/");
  }
  
  // For non-root directories, check if the path starts with the directory and has proper structure
  return path.startsWith(dir) && 
    path.substring(dir.length + 1).split("/").length === 1;
}