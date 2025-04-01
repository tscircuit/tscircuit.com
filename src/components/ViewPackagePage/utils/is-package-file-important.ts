export const isPackageFileImportant = (filePath: string) => {
  return (
    filePath.endsWith("README.md") ||
    filePath.endsWith("LICENSE") ||
    filePath.endsWith("index.ts") ||
    filePath.endsWith("index.tsx") ||
    filePath.endsWith(".circuit.tsx")
  )
}
