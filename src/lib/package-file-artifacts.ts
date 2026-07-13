export type PackageFileArtifactPaths = {
  pcbSvgPath?: string
  schematicSvgPath?: string
  circuitJsonPath?: string
}

type PackageFileLike = {
  file_path?: string | null
}

const normalizePath = (filePath: string) =>
  filePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")

const getDirectory = (filePath: string) => {
  const separatorIndex = filePath.lastIndexOf("/")
  return separatorIndex === -1 ? "" : filePath.slice(0, separatorIndex)
}

const getBasename = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1)

const isPcbSvg = (basename: string) =>
  basename === "pcb.svg" || /[._-]pcb\.svg$/.test(basename)

const isSchematicSvg = (basename: string) =>
  basename === "schematic.svg" ||
  /[._-]schematic\.svg$/.test(basename) ||
  /[._-]sch\.svg$/.test(basename)

const isCircuitJson = (basename: string) =>
  basename === "circuit.json" || basename.endsWith(".circuit.json")

const isArtifact = (filePath: string) => {
  const basename = getBasename(filePath).toLowerCase()
  return (
    isPcbSvg(basename) || isSchematicSvg(basename) || isCircuitJson(basename)
  )
}

const withoutExtension = (filePath: string) => {
  const basename = getBasename(filePath)
  const extensionIndex = basename.lastIndexOf(".")
  if (extensionIndex <= 0) return filePath
  return filePath.slice(0, filePath.length - (basename.length - extensionIndex))
}

const getCandidateDirectories = (selectedFilePath: string) => {
  const selectedDirectory = getDirectory(selectedFilePath)
  const candidates = [selectedDirectory]

  if (!isArtifact(selectedFilePath) && !selectedFilePath.startsWith("dist/")) {
    candidates.push(`dist/${withoutExtension(selectedFilePath)}`)

    if (!selectedDirectory) {
      candidates.push("dist")
    }
  }

  return [...new Set(candidates)]
}

export const getPackageFileArtifactPaths = (
  selectedFilePath: string,
  packageFiles: PackageFileLike[] = [],
): PackageFileArtifactPaths => {
  const normalizedSelectedPath = normalizePath(selectedFilePath)
  const normalizedFiles = packageFiles
    .map((file) => normalizePath(String(file.file_path || "")))
    .filter(Boolean)

  const artifacts: PackageFileArtifactPaths = {}

  for (const directory of getCandidateDirectories(normalizedSelectedPath)) {
    const filesInDirectory = normalizedFiles.filter(
      (filePath) => getDirectory(filePath) === directory,
    )
    const findArtifact = (matcher: (basename: string) => boolean) =>
      filesInDirectory.find((filePath) =>
        matcher(getBasename(filePath).toLowerCase()),
      )

    artifacts.pcbSvgPath ||= findArtifact(isPcbSvg)
    artifacts.schematicSvgPath ||= findArtifact(isSchematicSvg)
    artifacts.circuitJsonPath ||= findArtifact(isCircuitJson)
  }

  return artifacts
}
