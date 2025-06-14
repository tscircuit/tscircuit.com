const importanceMap = {
  "readme.md": 200,
  license: 100,
  "license.md": 100,
  "index.ts": 90,
  "index.tsx": 90,
  "circuit.tsx": 90,
}

/**
 * Determine if a file is considered "important" for display in the
 * `ImportantFilesView` component.
 *
 * Only "index" files that live in the root of the package should be flagged as
 * important. Nested paths are ignored.
 */
export const isPackageFileImportant = (filePath: string): boolean => {
  const normalized = filePath.replace(/^\.\/?/, "").toLowerCase()

  // Ignore files that are not in the package root
  if (normalized.includes("/")) return false

  return Object.keys(importanceMap).some(
    (name) => name.startsWith("index.") && normalized === name,
  )
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
