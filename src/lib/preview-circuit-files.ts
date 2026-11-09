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
        /(?:^|\/)circuit\.json(?:\.gz)?$|\.circuit\.json(?:\.gz)?$/i.test(path)
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
  return (
    [
      "dist/circuit.json",
      "dist/index/circuit.json",
      "dist/circuit.json.gz",
      "dist/index/circuit.json.gz",
    ].find((path) =>
      files.some((file) => normalizePreviewPath(file.file_path) === path),
    ) ?? files.find((file) => /\.json\.gz$/i.test(file.file_path))?.file_path
  )
}
