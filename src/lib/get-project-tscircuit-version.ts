import ts from "typescript"

const EXACT_VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

const parseJson = (name: string, source: string) => {
  const parsed = ts.parseConfigFileTextToJson(name, source)
  if (parsed.error) {
    throw new Error(
      `Cannot read ${name}: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n")}`,
    )
  }
  return parsed.config
}

/** Resolve the concrete installed package version used by this project. */
export function getProjectTscircuitVersion(files: Record<string, string>) {
  if (!files["package.json"]) return undefined
  const manifest = parseJson("package.json", files["package.json"])
  const requirement =
    manifest.dependencies?.tscircuit ?? manifest.devDependencies?.tscircuit
  if (!requirement) return undefined
  if (typeof requirement !== "string") {
    throw new Error("The tscircuit dependency must be a version string.")
  }

  const lockedVersions: string[] = []
  if (files["bun.lock"]) {
    const lock = parseJson("bun.lock", files["bun.lock"])
    const entry = lock.packages?.tscircuit?.[0]
    if (typeof entry === "string" && entry.startsWith("tscircuit@")) {
      lockedVersions.push(entry.slice("tscircuit@".length))
    }
  }
  if (files["package-lock.json"]) {
    const lock = parseJson("package-lock.json", files["package-lock.json"])
    const version =
      lock.packages?.["node_modules/tscircuit"]?.version ??
      lock.dependencies?.tscircuit?.version
    if (typeof version === "string") lockedVersions.push(version)
  }

  if (new Set(lockedVersions).size > 1) {
    throw new Error(
      "The lockfiles disagree on the tscircuit version. Sync the lockfiles before running the preview.",
    )
  }
  const lockedVersion = lockedVersions[0]
  if (lockedVersion && !EXACT_VERSION.test(lockedVersion)) {
    throw new Error("The lockfile contains an invalid tscircuit version.")
  }
  if (
    lockedVersion &&
    EXACT_VERSION.test(requirement) &&
    lockedVersion !== requirement
  ) {
    throw new Error(
      "package.json and the lockfile disagree on the tscircuit version. Update the lockfile before running the preview.",
    )
  }
  if (lockedVersion) return lockedVersion
  if (EXACT_VERSION.test(requirement)) return requirement

  throw new Error(
    "Pin an exact tscircuit version in package.json or include an up-to-date bun.lock or package-lock.json to preview with the project runtime.",
  )
}

export const getTscircuitWorkerUrls = (version: string) => [
  `https://jscdn.tscircuit.com/tscircuit/${version}/dist/webworker.min.js`,
  `https://cdn.jsdelivr.net/npm/tscircuit@${version}/dist/webworker.min.js`,
  `https://unpkg.com/tscircuit@${version}/dist/webworker.min.js`,
]

const inFlightWorkerDownloads = new Map<string, Promise<Blob>>()

export function fetchTscircuitWorker(version: string) {
  const existing = inFlightWorkerDownloads.get(version)
  if (existing) return existing

  const download = (async () => {
    for (const url of getTscircuitWorkerUrls(version)) {
      const response = await fetch(url)
      if (response.ok) return response.blob()
    }
    throw new Error(
      `Could not load the tscircuit ${version} worker. This version may predate bundled workers. Update the project dependency to a version that includes dist/webworker.min.js.`,
    )
  })()
  inFlightWorkerDownloads.set(version, download)
  void download.then(
    () => inFlightWorkerDownloads.delete(version),
    () => inFlightWorkerDownloads.delete(version),
  )
  return download
}
