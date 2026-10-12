import { projectConfig } from "@tscircuit/props"
import type { AnyCircuitElement } from "circuit-json"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"
import { normalizeProjectFilePath } from "../../../fake-snippets-api/utils/normalizeProjectFilePath"
import { Minimatch } from "minimatch"
import type { AssemblyStepCircuit } from "./download-assembly-step"

type AssemblyPackageFile = Pick<PackageFile, "package_file_id" | "file_path">

export async function* getPackageAssemblyCircuits({
  packageFiles,
  readFile,
  fallbackCircuitJson,
}: {
  packageFiles: AssemblyPackageFile[]
  readFile: (file: AssemblyPackageFile) => Promise<string>
  fallbackCircuitJson: AnyCircuitElement[]
}): AsyncGenerator<AssemblyStepCircuit> {
  const files = packageFiles.map((file) => ({
    ...file,
    file_path: normalizeProjectFilePath(file.file_path),
  }))
  const configFile = files.find(
    (file) => file.file_path === "tscircuit.config.json",
  )
  const config = configFile
    ? projectConfig.parse(JSON.parse(await readFile(configFile)))
    : null
  const includeBoardFiles = config?.includeBoardFiles?.filter(Boolean)

  if (!includeBoardFiles?.length) {
    yield { circuitJson: fallbackCircuitJson }
    return
  }

  const matchers = includeBoardFiles.map(
    (pattern) =>
      new Minimatch(normalizeProjectFilePath(pattern), { dot: true }),
  )
  // Build outputs are read for their source board, not matched a second time.
  const boardFiles = files.filter(
    (file) =>
      !file.file_path.startsWith("dist/") &&
      matchers.some((matcher) => matcher.match(file.file_path)),
  )
  if (!boardFiles.length) {
    throw new Error("No package files match includeBoardFiles")
  }

  for (const boardFile of boardFiles) {
    const filePath = boardFile.file_path
    const isCircuitJson = /(^|\/)circuit\.json$|\.circuit\.json$/i.test(
      filePath,
    )
    const outputPath = `dist/${filePath.replace(/(\.board|\.circuit)?\.tsx$/, "")}/circuit.json`
    const circuitFile = isCircuitJson
      ? boardFile
      : files.find((file) => file.file_path === outputPath)
    if (!circuitFile) {
      throw new Error(
        `Circuit JSON for ${filePath} is missing. Build and publish this board before downloading Assembly STEP.`,
      )
    }
    const circuitJson = JSON.parse(await readFile(circuitFile))
    if (!Array.isArray(circuitJson)) {
      throw new Error(`Invalid Circuit JSON for ${filePath}`)
    }
    yield { filePath, circuitJson }
  }
}
