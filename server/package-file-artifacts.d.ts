export type PackageFileArtifactPaths = {
  pcbSvgPath?: string
  schematicSvgPath?: string
  circuitJsonPath?: string
}

type PackageFileLike = {
  file_path?: string | null
}

export declare const getPackageFileArtifactPaths: (
  selectedFilePath: string,
  packageFiles?: PackageFileLike[],
) => PackageFileArtifactPaths
