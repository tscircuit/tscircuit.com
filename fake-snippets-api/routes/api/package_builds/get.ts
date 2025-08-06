import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapPackageBuild } from "fake-snippets-api/lib/public-mapping/public-map-package-build"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    package_build_id: z.string(),
  }),
  jsonResponse: z.object({
    package_build: z.any(),
  }),
})(async (req, ctx) => {
  const { package_build_id } = req.query

  if (!package_build_id) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "package_build_id is required",
    })
  }

  const packageBuild = ctx.db.packageBuilds.find(
    (build) => build.package_build_id === package_build_id,
  )

  if (!packageBuild) {
    return ctx.error(404, {
      error_code: "package_build_not_found",
      message: "Package build not found",
    })
  }

  const packageRelease = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === packageBuild.package_release_id,
  )

  if (!packageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const pkg = ctx.db.packages.find(
    (p) => p.package_id === packageRelease.package_id,
  )
  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  if (pkg.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "unauthorized",
      message: "You are not authorized to access this package build",
    })
  }

  const publicBuild = publicMapPackageBuild(packageBuild, {
    include_logs: true,
  })

  return ctx.json({
    package_build: publicBuild,
  })
})
