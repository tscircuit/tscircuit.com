import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackageRelease } from "fake-snippets-api/lib/public-mapping/public-map-package-release"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_id: z.string().optional(),
    package_name: z.string().optional(),
    version: z.string().optional(),
    is_latest: z.boolean().optional(),
    commit_sha: z.string().optional(),
    package_name_with_version: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: packageReleaseSchema,
  }),
})(async (req, ctx) => {
  let {
    package_id,
    package_name,
    is_latest = true,
    version,
    commit_sha,
    package_name_with_version,
  } = req.jsonBody

  if (package_name_with_version && !package_id) {
    const [packageName, parsedVersion] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((p) => p.name === packageName)

    if (!pkg) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: `Package not found: ${packageName}`,
      })
    }

    package_id = pkg.package_id
    version = parsedVersion
  }

  if (!package_id && package_name) {
    const pkg = ctx.db.packages.find((p) => p.name === package_name)
    if (!pkg) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: `Package not found: ${package_name}`,
      })
    }
    package_id = pkg.package_id
  }

  if (!package_id || !version) {
    return ctx.error(400, {
      error_code: "missing_options",
      message: "package_id or package_name and version are required",
    })
  }

  // Check if version already exists
  const existingRelease = ctx.db.packageReleases.find(
    (pr) => pr.package_id === package_id && pr.version === version,
  )

  if (existingRelease) {
    return ctx.error(400, {
      error_code: "version_already_exists",
      message: `Version ${version} already exists for this package`,
    })
  }

  // Update previous latest if needed
  if (is_latest) {
    ctx.db.packageReleases
      .filter((pr) => pr.package_id === package_id && pr.is_latest)
      .forEach((pr) => (pr.is_latest = false))
  }

  const newPackageRelease = ctx.db.addPackageRelease({
    package_id,
    is_latest,
    version,
    is_locked: false,
    created_at: new Date().toISOString(),
    commit_sha: commit_sha ?? null,
    circuit_json_build_error: null,
    circuit_json_build_error_last_updated_at: null,
    // Setting the transpiled as true on creation
    has_transpiled: true,
    transpilation_error: null,
  })

  // Update the package's latest_package_release_id if this is the latest release
  if (is_latest) {
    ctx.db.updatePackage(package_id, {
      latest_package_release_id: newPackageRelease.package_release_id,
      latest_version: version,
    })
  }

  return ctx.json({
    ok: true,
    package_release: publicMapPackageRelease(newPackageRelease, { db: ctx.db }),
  })
})
