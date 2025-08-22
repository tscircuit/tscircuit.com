import { PackageFile } from "@/types/package"
import { isComponentExported } from "./isComponentExported"

export const findMainEntrypointFileFromTscircuitConfig = (
  files: PackageFile[],
): PackageFile | null => {
  const configFile = files.find((file) => file.path === "tscircuit.config.json")

  if (configFile) {
    try {
      const config = JSON.parse(configFile.content)

      if (config && typeof config.mainEntrypoint === "string") {
        const mainComponentPath = config.mainEntrypoint

        const normalizedPath = mainComponentPath.startsWith("./")
          ? mainComponentPath.substring(2)
          : mainComponentPath

        return files.find((file) => file.path === normalizedPath) ?? null
      }
    } catch {}
  }

  return null
}

export const findTargetFile = ({
  files,
  filePathFromUrl,
  fallbackToAnyFile = true,
}: {
  files: PackageFile[]
  filePathFromUrl: string | null
  fallbackToAnyFile?: boolean
}): PackageFile | null => {
  if (files.length === 0) {
    return null
  }

  let targetFile: PackageFile | undefined | null = null

  if (filePathFromUrl) {
    const file = files.find((file) => file.path === filePathFromUrl)?.path
    if (
      file &&
      (!file.endsWith(".ts") || !file.endsWith(".tsx")) &&
      fallbackToAnyFile
    ) {
      targetFile = files.find((file) => file.path === filePathFromUrl) ?? null
    } else {
      const _isComponentExported = isComponentExported(
        files.find((file) => file.path === filePathFromUrl)?.content || "",
      )
      if (_isComponentExported) {
        targetFile = files.find((file) => file.path === filePathFromUrl) ?? null
      }
    }
  }

  if (!targetFile) {
    targetFile = findMainEntrypointFileFromTscircuitConfig(files)
  }
  if (!targetFile) {
    targetFile =
      files.find(
        (file) => file.path === "index.tsx" || file.path === "index.ts",
      ) ?? null
  }

  if (!targetFile) {
    targetFile =
      files.find((file) => file.path.endsWith(".circuit.tsx")) ?? null
  }

  if (!targetFile) {
    targetFile =
      files.find(
        (file) => file.path === "main.tsx" || file.path === "main.ts",
      ) ?? null
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path.endsWith(".tsx")) ?? null
  }

  if (!targetFile && files[0] && fallbackToAnyFile) {
    targetFile = files[0]
  }

  return targetFile
}
