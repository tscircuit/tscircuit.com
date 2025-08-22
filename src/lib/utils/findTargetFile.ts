import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import { PackageFile } from "@/types/package"

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

export const findTargetFile = (
  files: PackageFile[],
  filePathFromUrl: string | null,
): PackageFile | null => {
  if (files.length === 0) {
    return null
  }

  if (!filePathFromUrl) {
    files = files.filter((x) => !isHiddenFile(x.path))
  }

  let targetFile: PackageFile | null = null

  if (filePathFromUrl) {
    console.log("taregt", filePathFromUrl, files)
    targetFile = files.find((file) => file.path === filePathFromUrl) ?? null
  }

  if (!targetFile) {
    targetFile = findMainEntrypointFileFromTscircuitConfig(files)
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
