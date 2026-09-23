import ts from "typescript"

const VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/

function isVersionInRange(version: string, requirement: string) {
  const installed = VERSION.exec(version)
  if (!installed) return false
  if (version === requirement) return true

  const operator = requirement[0]
  if (operator !== "^" && operator !== "~") return false
  const minimum = VERSION.exec(requirement.slice(1))
  // Prerelease ranges need the full npm semver rules. Require an exact pin.
  if (!minimum || installed[4] || minimum[4]) return false

  const current = installed.slice(1, 4).map(Number)
  const lower = minimum.slice(1, 4).map(Number)
  const compare = (a: number[], b: number[]) =>
    a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
  const upper = [...lower]
  if (operator === "~") {
    upper[1] += 1
    upper[2] = 0
  } else if (upper[0] > 0) {
    upper[0] += 1
    upper[1] = 0
    upper[2] = 0
  } else if (upper[1] > 0) {
    upper[1] += 1
    upper[2] = 0
  } else {
    upper[2] += 1
  }
  return compare(current, lower) >= 0 && compare(current, upper) < 0
}

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
    const parsed = ts.parseConfigFileTextToJson("bun.lock", files["bun.lock"])
    if (parsed.error) {
      throw new Error(
        `Cannot read bun.lock: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n")}`,
      )
    }
    const lock = parsed.config
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
  const version =
    versions[0] ?? (VERSION.test(requirement) ? requirement : undefined)
  if (!version || !isVersionInRange(version, requirement)) {
    throw new Error(
      "Pin an exact tscircuit version in package.json or include an up-to-date bun.lock or package-lock.json to preview with the project runtime.",
    )
  }
  return version
}
