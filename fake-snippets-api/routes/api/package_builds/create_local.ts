import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { publicMapPackageBuild } from "fake-snippets-api/lib/public-mapping/public-map-package-build"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { normalizeProjectFilePath } from "fake-snippets-api/utils/normalizeProjectFilePath"
import { z } from "zod"

/**
 * Records a build that the user ran locally and uploaded with the release's
 * files (e.g. `tsci push --include-dist`). No cloud build is run, the uploaded
 * dist/ directory is used as the build output.
 */
export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      package_release_id: z.string().optional(),
      package_name_with_version: z.string().optional(),
    })
    .refine((v) => v.package_release_id || v.package_name_with_version, {
      message:
        "Must specify either package_release_id or package_name_with_version",
    }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_build: z.any(),
  }),
})(async (req, ctx) => {
  const package_release_id =
    req.jsonBody.package_release_id ??
    (await findPackageReleaseId(req.jsonBody.package_name_with_version!, ctx))
  const release = ctx.db.packageReleases.find(
    (release) => release.package_release_id === package_release_id,
  )
  const pkg =
    release &&
    ctx.db.packages.find((pkg) => pkg.package_id === release.package_id)

  if (!release || !pkg) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const canManagePackage =
    ctx.auth.personal_org_id === pkg.owner_org_id ||
    ctx.auth.orgs.some(
      (org) =>
        org.org_id === pkg.owner_org_id &&
        org.user_permissions.can_manage_packages,
    )
  if (!canManagePackage) {
    return ctx.error(403, {
      error_code: "forbidden",
      message:
        "You do not have permission to create a build for this package release",
    })
  }

  const hasDistFiles = ctx.db.packageFiles.some(
    (file) =>
      file.package_release_id === release.package_release_id &&
      normalizeProjectFilePath(file.file_path).startsWith("dist/"),
  )
  if (!hasDistFiles) {
    return ctx.error(400, {
      error_code: "missing_build_output",
      message:
        "The package release has no dist/ files, upload the build output before creating a local build",
    })
  }

  const now = new Date().toISOString()
  const completedLogs = [
    {
      message:
        "Build output was uploaded with the release, no cloud build was run",
    },
  ]

  const packageBuild = ctx.db.addPackageBuild({
    package_release_id: release.package_release_id,
    created_at: now,
    build_source: "local",
    transpilation_logs: [],
    circuit_json_build_logs: [],
    build_in_progress: false,
    build_error_last_updated_at: now,
    user_code_job_started_at: now,
    user_code_job_completed_at: now,
    user_code_job_completed_logs: completedLogs,
  })

  // addPackageBuild points the release at the new build, read it again so
  // that isn't overwritten
  ctx.db.updatePackageRelease({
    ...ctx.db.getPackageReleaseById(release.package_release_id)!,
    active_package_build_id: packageBuild.package_build_id,
    ready_to_build: true,
    user_code_job_started_at: now,
    user_code_job_completed_at: now,
    user_code_job_completed_logs: completedLogs,
    user_code_job_error: null,
  })
  ctx.db.updatePackage(pkg.package_id, { updated_at: now })

  return ctx.json({
    ok: true,
    package_build: publicMapPackageBuild(packageBuild, { include_logs: true }),
  })
})
