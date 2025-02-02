import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
    is_locked: z.boolean().optional(),
    is_latest: z.boolean().optional(),
    license: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const {
    package_release_id,
    package_name_with_version,
    is_locked,
    is_latest,
    license,
  } = req.jsonBody
  let releaseId = package_release_id

  // Handle package_name_with_version lookup
  if (!releaseId && package_name_with_version) {
    const [packageName, version] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((p) => p.name === packageName)
    if (pkg) {
      const release = ctx.db.packageReleases.find(
        (pr) => pr.package_id === pkg.package_id && pr.version === version,
      )
      if (release) {
        releaseId = release.package_release_id
      }
    }
  }

  if (!releaseId) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const delta = { is_locked, is_latest, license }
  if (
    Object.keys(delta).filter(
      (k) => delta[k as keyof typeof delta] !== undefined,
    ).length === 0
  ) {
    return ctx.error(400, {
      error_code: "no_fields_provided",
      message: "No fields provided to update",
    })
  }

  const release = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === releaseId,
  )
  if (!release) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Handle is_latest updates
  if (is_latest !== undefined && is_latest) {
    ctx.db.packageReleases
      .filter(
        (pr) =>
          pr.package_id === release.package_id &&
          pr.package_release_id !== releaseId &&
          pr.is_latest,
      )
      .forEach((pr) => {
        pr.is_latest = false
      })
  }

  // Update the release
  Object.assign(release, {
    ...(is_locked !== undefined && { is_locked }),
    ...(is_latest !== undefined && { is_latest }),
    ...(license !== undefined && { license }),
  })

  ctx.db.updatePackageRelease(release)

  return ctx.json({
    ok: true,
  })
})
