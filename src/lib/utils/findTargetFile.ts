import type { FileContent } from "@/components/package-port/CodeEditor"

export const findTargetFile = (
  files: FileContent[],
  filePathFromUrl: string | null,
): FileContent | null => {
  if (files.length === 0) return null

  let targetFile: FileContent | null = null

  if (!targetFile && filePathFromUrl) {
    targetFile = files.find((file) => file.path === filePathFromUrl) ?? null
  }

  const configFile = files.find((file) => file.path === "tscircuit.config.json")
  if (configFile) {
    try {
      const config = JSON.parse(configFile.content)
      if (config && typeof config.mainComponent === "string") {
        const mainComponentPath = config.mainComponent
        const normalizedPath = mainComponentPath.startsWith("./")
          ? mainComponentPath.substring(2)
          : mainComponentPath
        targetFile = files.find((file) => file.path === normalizedPath) ?? null
      }
    } catch {}
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path === "index.tsx") ?? null
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path.endsWith(".tsx")) ?? null
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path === "index.ts") ?? null
  }

  if (!targetFile && files[0]) {
    targetFile = files[0]
  }

  return targetFile
}
