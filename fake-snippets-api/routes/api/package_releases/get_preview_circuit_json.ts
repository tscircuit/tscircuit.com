import path from "node:path"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { normalizeProjectFilePath } from "fake-snippets-api/utils/normalizeProjectFilePath"
import { z } from "zod"

type TscircuitConfig = {
  previewComponentPath?: string
  mainEntrypoint?: string
}

type CircuitJsonResult = {
  circuitJson: unknown[]
  componentPath?: string
}

const parseCircuitJson = (contentText?: string | null) => {
  if (!contentText) return null
  try {
    const parsed = JSON.parse(contentText)
    return Array.isArray(parsed) ? parsed : null
  } catch (error) {
    return null
  }
}

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    package_release_id: z.string().uuid().optional(),
    package_name_with_version: z.string().optional(),
    package_name: z.string().optional(),
    package_id: z.string().uuid().optional(),
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
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })

    return packageReleases[0]
  }

  let foundRelease =
    package_release_id && ctx.db.getPackageReleaseById(package_release_id)

  if (!foundRelease && package_name_with_version) {
    const [packageName, parsedVersion] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((x) => x.name === packageName)
    foundRelease = ctx.db.packageReleases.find((x) => {
      return x.version === parsedVersion && x.package_id === pkg?.package_id
    })
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

  const fetchCircuitJsonByComponentPath = (
    componentPath: string,
  ): CircuitJsonResult | null => {
    const extension = path.posix.extname(componentPath)
    const componentName = path.posix.basename(componentPath, extension)
    const circuitJsonPath = normalizeProjectFilePath(
      `dist/${componentName}/circuit.json`,
    )
    const circuitFile = getFileByNormalizedPath(circuitJsonPath)
    const circuitJson = parseCircuitJson(circuitFile?.content_text)
    if (!circuitJson) return null
    return { circuitJson, componentPath }
  }

  let circuitJsonResult: CircuitJsonResult | null = null

  if (previewComponentPath) {
    circuitJsonResult = fetchCircuitJsonByComponentPath(previewComponentPath)
  }

  if (!circuitJsonResult && mainEntrypoint) {
    circuitJsonResult = fetchCircuitJsonByComponentPath(mainEntrypoint)
  }

  if (!circuitJsonResult) {
    const fallbackPaths = ["dist/index/circuit.json", "dist/circuit.json"]
    for (const fallbackPath of fallbackPaths) {
      const circuitFile = getFileByNormalizedPath(fallbackPath)
      const circuitJson = parseCircuitJson(circuitFile?.content_text)
      if (circuitJson) {
        circuitJsonResult = { circuitJson }
        break
      }
    }
  }

  return ctx.json({
    preview_circuit_json_response: {
      circuit_json: circuitJsonResult?.circuitJson,
      component_path: circuitJsonResult?.componentPath,
      circuit_json_found: Boolean(circuitJsonResult?.circuitJson),
    },
  })
})
