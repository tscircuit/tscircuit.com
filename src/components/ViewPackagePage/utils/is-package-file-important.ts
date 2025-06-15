const importanceMap = {
  "readme.md": 200,
  readme: 200,
  license: 100,
  "license.md": 100,
  "index.ts": 90,
  "index.tsx": 90,
  "circuit.tsx": 90,
}

/**
 * Determines if a file is considered "important" for display in the
 * `ImportantFilesView` component.
 *
 * A file is deemed important if it resides in the root directory of the package
 * and has a positive importance score. Nested paths are not considered important.
 */
export const isPackageFileImportant = (filePath: string): boolean => {
  const normalized = filePath.replace(/^\.\/?/, "").toLowerCase()
  if (normalized.split("/").length > 1) {
    return false
  }
  return scorePackageFileImportance(filePath) > 0
}

// Kept for backward compatibility with older imports
export const scorePackageFileImportance = (filePath: string): number => {
  const lowerCaseFilePath = filePath.toLowerCase()
  for (const [key, value] of Object.entries(importanceMap)) {
    if (lowerCaseFilePath.endsWith(key)) {
      return value
    }
  }
  return 0
}
