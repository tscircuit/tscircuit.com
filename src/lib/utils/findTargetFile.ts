import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import { PackageFile } from "@/types/package"
import { isComponentExported } from "./isComponentExported"

export const findMainEntrypointFileFromTscircuitConfig = (
  files: PackageFile[],
): PackageFile | null => {
  const configFile = files.find((file) => file.path === "tscircuit.config.json")
  if (!configFile) return null

  try {
    const config = JSON.parse(configFile.content)
    if (!config?.mainEntrypoint) return null

    const normalizedPath = config.mainEntrypoint.startsWith("./")
      ? config.mainEntrypoint.substring(2)
      : config.mainEntrypoint

    return files.find((file) => file.path === normalizedPath) ?? null
  } catch {
    return null
  }
}

export const findPreviewComponentFileFromTscircuitConfig = (
  files: PackageFile[],
): PackageFile | null => {
  const configFile = files.find((file) => file.path === "tscircuit.config.json")
  if (!configFile) return null

  try {
    const config = JSON.parse(configFile.content)
    if (!config?.previewComponentPath) return null

    const normalizedPath = config.previewComponentPath.startsWith("./")
      ? config.previewComponentPath.substring(2)
      : config.previewComponentPath

    return files.find((file) => file.path === normalizedPath) ?? null
  } catch {
    return null
  }
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
  if (!filePathFromUrl) {
    files = files.filter((x) => !isHiddenFile(x.path))
  }

  if (filePathFromUrl) {
    const file = files.find((file) => file.path === filePathFromUrl)?.path
    if (
      file &&
      !file.endsWith(".ts") &&
      !file.endsWith(".tsx") &&
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
    // First check for previewComponentPath (takes precedence for preview rendering)
    targetFile = findPreviewComponentFileFromTscircuitConfig(files)
  }
  if (!targetFile) {
    // Fall back to mainEntrypoint
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
