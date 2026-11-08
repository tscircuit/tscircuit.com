import { getPackageFileArtifactPaths } from "./package-file-artifacts"

export const normalizePreviewPath = (path: string) =>
  path.replace(/\\/g, "/").replace(/^(?:\.\/|\/)+/, "")

export function getPreviewCircuitFiles<T extends { file_path: string }>(
  files: T[] = [],
): T[] {
  return files
    .filter((file) => {
      const path = normalizePreviewPath(file.file_path)
      return (
        !path.startsWith("node_modules/") &&
        /(?:^|\/)circuit\.json$|\.circuit\.json$/i.test(path)
      )
    })
    .sort((a, b) =>
      normalizePreviewPath(a.file_path).localeCompare(
        normalizePreviewPath(b.file_path),
      ),
    )
}

export function getDefaultPreviewFilePath(
  files: { file_path: string }[],
  componentPath?: string,
): string | undefined {
  if (componentPath) {
    return getPackageFileArtifactPaths(componentPath, files).circuitJsonPath
  }
  return ["dist/circuit.json", "dist/index/circuit.json"].find((path) =>
    files.some((file) => normalizePreviewPath(file.file_path) === path),
  )
}
