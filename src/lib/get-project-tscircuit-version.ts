import JSON5 from "json5"
import { satisfies, valid } from "semver"

/** Resolve the installed package, not the minimum version of a dependency range. */
export function getProjectTscircuitVersion(files: Record<string, string>) {
  if (!files["package.json"]) return undefined
  const manifest = JSON.parse(files["package.json"])
  const requirement =
    manifest.dependencies?.tscircuit ?? manifest.devDependencies?.tscircuit
  if (!requirement) return undefined
  if (typeof requirement !== "string") {
    throw new Error("The tscircuit dependency must be a version string.")
  }

  const versions: string[] = []
  if (files["bun.lock"]) {
    const lock = JSON5.parse(files["bun.lock"])
    const entry = lock.packages?.tscircuit?.[0]
    if (typeof entry === "string" && entry.startsWith("tscircuit@")) {
      versions.push(entry.slice("tscircuit@".length))
    }
  }
  if (files["package-lock.json"]) {
    const lock = JSON.parse(files["package-lock.json"])
    const version =
      lock.packages?.["node_modules/tscircuit"]?.version ??
      lock.dependencies?.tscircuit?.version
    if (typeof version === "string") versions.push(version)
  }
  if (new Set(versions).size > 1) {
    throw new Error(
      "The lockfiles disagree on the tscircuit version. Sync the lockfiles before running the preview.",
    )
  }
  const version = versions[0] ?? valid(requirement)
  if (!version || !valid(version) || !satisfies(version, requirement)) {
    throw new Error(
      "Pin an exact tscircuit version in package.json or include an up-to-date bun.lock or package-lock.json to preview with the project runtime.",
    )
  }
  return version
}
