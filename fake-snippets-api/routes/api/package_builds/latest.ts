import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapPackageBuild } from "fake-snippets-api/lib/public-mapping/public-map-package-build"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    package_id: z.string().optional(),
    package_release_id: z.string().optional(),
  }),
  jsonResponse: z.object({
    package_build: z.any().nullable(),
  }),
})(async (req, ctx) => {
  const { package_id, package_release_id } = req.query

  if (!package_id && !package_release_id) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "Either package_id or package_release_id must be provided",
    })
  }

  let targetPackageId = package_id

  if (package_release_id) {
    const packageRelease = ctx.db.packageReleases.find(
      (pr) => pr.package_release_id === package_release_id,
    )
    if (!packageRelease) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "Package release not found",
      })
    }
    targetPackageId = packageRelease.package_id
  }

  if (targetPackageId) {
    const pkg = ctx.db.packages.find((p) => p.package_id === targetPackageId)
    if (!pkg) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: "Package not found",
      })
    }
    if (pkg.creator_account_id !== ctx.auth.account_id) {
      console.log(
        pkg.creator_account_id !== ctx.auth.account_id,
        pkg.creator_account_id,
        ctx.auth.account_id,
      )
      return ctx.error(403, {
        error_code: "unauthorized",
        message: "You are not authorized to access this package",
      })
    }
  }

  let builds = ctx.db.packageBuilds

  if (package_id) {
    const packageReleases = ctx.db.packageReleases.filter(
      (x) => x.package_id === package_id,
    )
    if (packageReleases.length === 0) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: "Package not found",
      })
    }

    const packageReleaseIds = packageReleases
      .filter((pr) => pr.package_id === package_id)
      .map((pr) => pr.package_release_id)

    builds = builds.filter((build) =>
      packageReleaseIds.includes(build.package_release_id),
    )
  }

  if (package_release_id) {
    builds = builds.filter(
      (build) => build.package_release_id === package_release_id,
    )
  }

  builds = builds.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const latestBuild = builds[0] || null

  if (!latestBuild) {
    return ctx.json({
      package_build: null,
    })
  }

  const publicBuild = publicMapPackageBuild(latestBuild, {
    include_logs: true,
  })

  return ctx.json({
    package_build: publicBuild,
  })
})
