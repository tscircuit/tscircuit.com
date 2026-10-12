const normalizePath = (filePath) =>
  filePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "")

const getDirectory = (filePath) => {
  const separatorIndex = filePath.lastIndexOf("/")
  return separatorIndex === -1 ? "" : filePath.slice(0, separatorIndex)
}

const getBasename = (filePath) => filePath.slice(filePath.lastIndexOf("/") + 1)

const isPcbSvg = (basename) =>
  basename === "pcb.svg" || /[._-]pcb\.svg$/.test(basename)

const isSchematicSvg = (basename) =>
  basename === "schematic.svg" ||
  /[._-]schematic\.svg$/.test(basename) ||
  /[._-]sch\.svg$/.test(basename)

const isCircuitJson = (basename) =>
  basename === "circuit.json" || basename.endsWith(".circuit.json")

const isArtifact = (filePath) => {
  const basename = getBasename(filePath).toLowerCase()
  return (
    isPcbSvg(basename) || isSchematicSvg(basename) || isCircuitJson(basename)
  )
}

const withoutExtension = (filePath) => {
  const basename = getBasename(filePath)
  const extensionIndex = basename.lastIndexOf(".")
  if (extensionIndex <= 0) return filePath
  return filePath.slice(0, filePath.length - (basename.length - extensionIndex))
}

const getCandidateDirectories = (selectedFilePath) => {
  const selectedDirectory = getDirectory(selectedFilePath)
  const candidates = [selectedDirectory]

  if (!isArtifact(selectedFilePath) && !selectedFilePath.startsWith("dist/")) {
    if (selectedFilePath.toLowerCase().endsWith(".circuit.tsx")) {
      candidates.push(
        `dist/${selectedFilePath.slice(0, -".circuit.tsx".length)}`,
      )
    }
    candidates.push(`dist/${withoutExtension(selectedFilePath)}`)

    if (!selectedDirectory) {
      candidates.push("dist")
    }
  }

  return [...new Set(candidates)]
}

export const getPackageFileArtifactPaths = (
  selectedFilePath,
  packageFiles = [],
) => {
  const normalizedSelectedPath = normalizePath(selectedFilePath)
  const normalizedFiles = packageFiles
    .map((file) => normalizePath(String(file.file_path || "")))
    .filter(Boolean)

  const artifacts = {}

  for (const directory of getCandidateDirectories(normalizedSelectedPath)) {
    const filesInDirectory = normalizedFiles.filter(
      (filePath) => getDirectory(filePath) === directory,
    )
    const findArtifact = (matcher) =>
      filesInDirectory.find((filePath) =>
        matcher(getBasename(filePath).toLowerCase()),
      )

    artifacts.pcbSvgPath ||= findArtifact(isPcbSvg)
    artifacts.schematicSvgPath ||= findArtifact(isSchematicSvg)
    artifacts.circuitJsonPath ||= findArtifact(isCircuitJson)
  }

  return artifacts
}
