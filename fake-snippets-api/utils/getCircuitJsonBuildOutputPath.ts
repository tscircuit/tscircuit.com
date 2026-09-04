import path from "node:path"
import { normalizeProjectFilePath } from "./normalizeProjectFilePath"

export const getCircuitJsonBuildOutputPath = (sourcePath: string) => {
  const normalizedSourcePath = normalizeProjectFilePath(sourcePath)
    .replace(/^\/+/, "")
    .replace(/^dist\//, "")

  const outputDir =
    normalizedSourcePath === "circuit.json" ||
    normalizedSourcePath.endsWith("/circuit.json")
      ? path.posix.dirname(normalizedSourcePath)
      : normalizedSourcePath
          .replace(/(\.board|\.circuit)?\.tsx$/, "")
          .replace(/\.circuit\.json$/, "")

  return outputDir && outputDir !== "."
    ? `dist/${outputDir}/circuit.json`
    : "dist/circuit.json"
}
