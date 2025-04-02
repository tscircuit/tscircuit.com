const importanceMap = {
  "readme.md": 200,
  "license": 100,
  "license.md": 100,
  "index.ts": 90,
  "index.tsx": 90,
  "circuit.tsx": 90,
}

export const scorePackageFileImportance = (filePath: string) => {
  const lowerCaseFilePath = filePath.toLowerCase()
  for (const [key, value] of Object.entries(importanceMap)) {
    if (lowerCaseFilePath.endsWith(key)) {
      return value
    }
  }
  return 0
}

export const isPackageFileImportant = (filePath: string) => {
  return scorePackageFileImportance(filePath) > 0
}
