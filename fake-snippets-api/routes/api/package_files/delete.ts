import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
    file_path: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { file_path } = req.jsonBody

  let packageReleaseId = req.jsonBody.package_release_id

  if (!packageReleaseId && req.jsonBody.package_name_with_version) {
    const foundPackageReleaseId = await findPackageReleaseId(
      req.jsonBody.package_name_with_version,
      ctx,
    )
    if (foundPackageReleaseId) {
      packageReleaseId = foundPackageReleaseId
    }
  }

  if (!packageReleaseId) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Get the package release to check permissions
  const packageRelease = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === packageReleaseId,
  )

  if (!packageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Get the package to check permissions
  const existingpackage = ctx.db.packages.find(
    (p) => p.package_id === packageRelease.package_id,
  )

  if (!existingpackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  // Check if user has permission to delete the file
  if (existingpackage.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to delete files in this package",
    })
  }

  // Find the file
  const packageFile = ctx.db.packageFiles.find(
    (f) =>
      f.file_path === file_path && f.package_release_id === packageReleaseId,
  )

  if (!packageFile) {
    return ctx.error(404, {
      error_code: "file_not_found",
      message: "Package file not found",
    })
  }

  // Delete the file using deletePackageFile method
  const deleted = ctx.db.deletePackageFile(packageFile.package_file_id)

  if (!deleted) {
    return ctx.error(500, {
      error_code: "file_deletion_failed",
      message: "Failed to delete package file",
    })
  }

  return ctx.json({
    ok: true,
  })
})
