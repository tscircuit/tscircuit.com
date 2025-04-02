const RESTRICTED_DIRS = ["/node_modules/", "/dist/", "/.git/"]

/**
 * A normalized project path always starts with "./" and never ends with a slash.
 * It has no backwards slashes and no double slashes. It does not go to parent
 * directories. It is not a directory (must have a file extension)
 *
 * GOOD:
 *  - src/index.ts
 *  - README.md
 *
 * BAD:
 * - ./README.md
 * - ./src/index.ts
 * - src\index.ts
 * - ../README.md
 * - ./src/
 * - ./src
 *
 * Additionally, throw on directories that should never be included, e.g.
 * - node_modules
 * - dist
 * - .git
 */
export const normalizeProjectFilePathAndValidate = (rawPath: string) => {
  const normalizedPath = normalizeProjectFilePath(rawPath)

  if (normalizedPath.includes("../")) {
    throw new Error(
      "Invalid project file path. Parent directories are not allowed.",
    )
  }

  if (RESTRICTED_DIRS.some((dir) => normalizedPath.includes(dir))) {
    throw new Error(
      `Invalid project file path. Restricted directories (${RESTRICTED_DIRS.map(
        (rd) => rd.slice(1, -1),
      ).join(", ")}) are not allowed.`,
    )
  }

  if (!normalizedPath.includes(".")) {
    throw new Error(
      `Invalid project file path. Must have a file extension. Given "${rawPath}"`,
    )
  }

  return normalizedPath
}

export const normalizeProjectFilePath = (rawPath: string) => {
  let normalizedPath = rawPath.trim() // Remove leading/trailing whitespace
  normalizedPath = normalizedPath.replace(/\/+/g, "/") // Replace multiple consecutive slashes with a single slash
  normalizedPath = normalizedPath.replace(/^\.\//, "") // Remove leading "./"
  normalizedPath = normalizedPath.replace(/\/$/, "") // Remove trailing slash
  normalizedPath = normalizedPath.replace(/\\/g, "/") // Replace backslashes with forward slashes
  normalizedPath = normalizedPath.replace(/^\//, "") // Remove leading "/"

  return normalizedPath
}
