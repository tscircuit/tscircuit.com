import * as zt from "fake-snippets-api/lib/db/schema"
import { publicMapPackageRelease } from "fake-snippets-api/lib/public-mapping/public-map-package-release"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  commonParams: z.object({
    include_logs: z.boolean().optional().default(false),
    include_ai_review: z.boolean().optional().default(false),
  }),
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
    package_name: z.string().optional(),
    package_id: z.string().optional(),
    is_latest: z.boolean().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: zt.packageReleaseSchema,
  }),
})(async (req, ctx) => {
  const {
    package_release_id,
    package_name_with_version,
    package_name,
    package_id,
    is_latest,
  } = req.jsonBody

  // Handle package_name with is_latest
  if (package_name && is_latest === true) {
    const pkg = ctx.db.packages.find((x) => x.name === package_name)

    if (!pkg) {
      return ctx.error(404, {
        error_code: "package_not_found",
        message: "Package not found",
      })
    }

    // Sort releases by version to find the latest one
    const packageReleases = ctx.db.packageReleases
      .filter((x) => x.package_id === pkg.package_id)
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })

    if (packageReleases.length === 0) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "No releases found for this package",
      })
    }

    return ctx.json({
      ok: true,
      package_release: publicMapPackageRelease(packageReleases[0], {
        include_ai_review: req.commonParams?.include_ai_review,
        db: ctx.db,
      }),
    })
  }

  // Handle package_id with is_latest
  if (package_id && is_latest === true) {
    // Sort releases by version to find the latest one
    const packageReleases = ctx.db.packageReleases
      .filter((x) => x.package_id === package_id)
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })

    if (packageReleases.length === 0) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "No releases found for this package",
      })
    }

    return ctx.json({
      ok: true,
      package_release: publicMapPackageRelease(packageReleases[0], {
        include_ai_review: req.commonParams?.include_ai_review,
        db: ctx.db,
      }),
    })
  }

  if (package_name_with_version && !package_release_id) {
    const [packageName, parsedVersion] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((x) => x.name === packageName)
    const pkgRelease = ctx.db.packageReleases.find((x) => {
      return x.version == parsedVersion && x.package_id == pkg?.package_id
    })

    if (!pkgRelease) {
      return ctx.error(404, {
        error_code: "package_release_not_found",
        message: "Package release not found",
      })
    }

    return ctx.json({
      ok: true,
      package_release: publicMapPackageRelease(pkgRelease, {
        include_ai_review: req.commonParams?.include_ai_review,
        db: ctx.db,
      }),
    })
  }

  const foundRelease =
    package_release_id && ctx.db.getPackageReleaseById(package_release_id)

  if (!foundRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  return ctx.json({
    ok: true,
    package_release: publicMapPackageRelease(foundRelease, {
      include_logs: req.commonParams?.include_logs,
      include_ai_review: req.commonParams?.include_ai_review,
      db: ctx.db,
    }),
  })
})
