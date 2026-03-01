import path from "node:path"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { normalizeProjectFilePath } from "fake-snippets-api/utils/normalizeProjectFilePath"
import { z } from "zod"

type TscircuitConfig = {
  previewComponentPath?: string
  mainEntrypoint?: string
}

const entrypointFileNames = [
  "index.tsx",
  "index.circuit.tsx",
  "main.tsx",
  "main.circuit.tsx",
]

const hasValidPreviewExtension = (filePath: string) =>
  filePath.endsWith(".tsx") || filePath.endsWith(".circuit.json")

const isBoardFile = (filePath: string) => filePath.endsWith(".board.tsx")

const getInitialComponentPath = (filePaths: string[]) => {
  const normalizedPaths = filePaths
    .map((filePath) => normalizeProjectFilePath(filePath))
    .filter(
      (filePath) =>
        hasValidPreviewExtension(filePath) &&
        !filePath.startsWith("dist/") &&
        !filePath.startsWith("node_modules/"),
    )

  const uniquePaths = [...new Set(normalizedPaths)]

  const rootEntrypoint = entrypointFileNames.find((fileName) =>
    uniquePaths.includes(fileName),
  )
  if (rootEntrypoint) return rootEntrypoint

  const commonEntrypoint = ["lib", "src"]
    .flatMap((dirName) =>
      entrypointFileNames.map((fileName) => `${dirName}/${fileName}`),
    )
    .find((entrypointPath) => uniquePaths.includes(entrypointPath))
  if (commonEntrypoint) return commonEntrypoint

  const recursiveEntrypoint = uniquePaths
    .filter((filePath) => {
      const fileName = path.posix.basename(filePath)
      const depth = filePath.split("/").length - 1
      return entrypointFileNames.includes(fileName) && depth <= 3
    })
    .sort()[0]
  if (recursiveEntrypoint) return recursiveEntrypoint

  const boardFile = uniquePaths.filter(isBoardFile).sort()[0]
  if (boardFile) return boardFile

  return uniquePaths.sort()[0]
}

const parseCircuitJson = (contentText: string | null) => {
  if (!contentText) return null
  try {
    const parsed = JSON.parse(contentText)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error parsing circuit.json", { error })
    return null
  }
}

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
    package_name: z.string().optional(),
    package_id: z.string().optional(),
    is_latest: z.boolean().optional().default(true),
  }),
  jsonResponse: z.object({
    preview_circuit_json_response: z.object({
      circuit_json: z.array(z.any()).optional(),
      component_path: z.string().optional(),
      circuit_json_found: z.boolean(),
    }),
  }),
})(async (req, ctx) => {
  const {
    package_release_id,
    package_name_with_version,
    package_name,
    package_id,
    is_latest,
  } = req.commonParams

  const findLatestPackageRelease = (targetPackageId: string) => {
    const packageReleases = ctx.db.packageReleases
      .filter((release) => release.package_id === targetPackageId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    return packageReleases[0]
  }

  let foundRelease =
    package_release_id && ctx.db.getPackageReleaseById(package_release_id)

  if (!foundRelease && package_name_with_version) {
    const [packageName, parsedVersion] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((x) => x.name === packageName)
    foundRelease = ctx.db.packageReleases.find(
      (x) => x.version === parsedVersion && x.package_id === pkg?.package_id,
    )
  }

  if (!foundRelease && package_name && is_latest) {
    const pkg = ctx.db.packages.find((x) => x.name === package_name)
    if (pkg) {
      foundRelease = findLatestPackageRelease(pkg.package_id)
    }
  }

  if (!foundRelease && package_id && is_latest) {
    foundRelease = findLatestPackageRelease(package_id)
  }

  if (!foundRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const packageFiles = ctx.db.packageFiles.filter(
    (file) => file.package_release_id === foundRelease.package_release_id,
  )

  const getFileByNormalizedPath = (candidatePath: string) => {
    const normalizedCandidate = normalizeProjectFilePath(candidatePath)
    return packageFiles.find(
      (file) =>
        normalizeProjectFilePath(file.file_path) === normalizedCandidate,
    )
  }

  const configFile = getFileByNormalizedPath("tscircuit.config.json")
  let tscircuitConfig: TscircuitConfig | null = null

  if (configFile?.content_text) {
    try {
      tscircuitConfig = JSON.parse(configFile.content_text)
    } catch (error) {
      console.error("Failed to parse tscircuit config", { error })
    }
  }

  const previewComponentPath = tscircuitConfig?.previewComponentPath
  const mainEntrypoint = tscircuitConfig?.mainEntrypoint

  const fetchCircuitJsonByComponentPath = (componentPath: string) => {
    const isCircuitJsonPath = componentPath.endsWith("circuit.json")
    const extension = path.posix.extname(componentPath)
    const pathWithoutExt = componentPath.slice(0, -extension.length)
    const circuitJsonPath = normalizeProjectFilePath(
      isCircuitJsonPath
        ? `dist/${componentPath}`
        : `dist/${pathWithoutExt}/circuit.json`,
    )
    const circuitFile = getFileByNormalizedPath(circuitJsonPath)
    const circuitJson = parseCircuitJson(circuitFile?.content_text ?? null)
    if (!circuitJson) return null
    return { circuitJson }
  }

  if (previewComponentPath) {
    const previewCircuit = fetchCircuitJsonByComponentPath(previewComponentPath)
    if (previewCircuit) {
      return ctx.json({
        preview_circuit_json_response: {
          circuit_json: previewCircuit.circuitJson,
          component_path: previewComponentPath,
          circuit_json_found: true,
        },
      })
    }

    return ctx.json({
      preview_circuit_json_response: {
        circuit_json_found: false,
      },
    })
  }

  if (mainEntrypoint) {
    const entrypointCircuit = fetchCircuitJsonByComponentPath(mainEntrypoint)
    if (entrypointCircuit) {
      return ctx.json({
        preview_circuit_json_response: {
          circuit_json: entrypointCircuit.circuitJson,
          component_path: mainEntrypoint,
          circuit_json_found: true,
        },
      })
    }
  }

  const packageFilePaths = packageFiles
    .map((file) => file.file_path)
    .filter((filePath): filePath is string => Boolean(filePath))

  const initialComponentPath = getInitialComponentPath(packageFilePaths)
  if (initialComponentPath) {
    const initialCircuit = fetchCircuitJsonByComponentPath(initialComponentPath)
    if (initialCircuit) {
      return ctx.json({
        preview_circuit_json_response: {
          circuit_json: initialCircuit.circuitJson,
          component_path: initialComponentPath,
          circuit_json_found: true,
        },
      })
    }
  }

  const fallbackCircuitPaths = ["dist/circuit.json", "dist/index/circuit.json"]
  for (const fallbackPath of fallbackCircuitPaths) {
    const circuitFile = getFileByNormalizedPath(fallbackPath)
    const circuitJson = parseCircuitJson(circuitFile?.content_text ?? null)
    if (circuitJson) {
      return ctx.json({
        preview_circuit_json_response: {
          circuit_json: circuitJson,
          circuit_json_found: true,
        },
      })
    }
  }

  return ctx.json({
    preview_circuit_json_response: {
      circuit_json_found: false,
    },
  })
})
