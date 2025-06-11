import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackageRelease } from "fake-snippets-api/lib/public-mapping/public-map-package-release"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  commonParams: z.object({
    include_ai_review: z.boolean().optional().default(false),
  }),
  jsonBody: z
    .object({
      package_id: z.string().optional(),
      package_name: z.string().optional(),
      is_latest: z.boolean().optional(),
      version: z.string().optional(),
      commit_sha: z.string().optional(),
    })
    .refine(({ package_id, package_name }) => {
      if (package_id && package_name) {
        return false
      }
      return true
    }, "package_id and package_name are mutually exclusive")
    .refine(({ package_id, package_name }) => {
      if (!package_id && !package_name) {
        return false
      }
      return true
    }, "package_id or package_name is required"),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_releases: z.array(packageReleaseSchema),
  }),
})(async (req, ctx) => {
  const { package_id, package_name, is_latest, version, commit_sha } =
    req.jsonBody

  if (!package_id && !package_name && !is_latest && !version && !commit_sha) {
    return ctx.error(400, {
      error_code: "invalid_query",
      message:
        "At least one of package_id, package_name, is_latest, version or commit_sha is required",
    })
  }

  let releases = ctx.db.packageReleases

  // Apply filters
  if (package_id) {
    releases = releases.filter((pr) => pr.package_id === package_id)
  }

  if (package_name) {
    const pkg = ctx.db.packages.find((p) => p.name === package_name)
    if (pkg) {
      releases = releases.filter((pr) => pr.package_id === pkg.package_id)
    } else {
      releases = []
    }
  }

  if (is_latest !== undefined) {
    releases = releases.filter((pr) => pr.is_latest === is_latest)
  }

  if (version) {
    releases = releases.filter((pr) => pr.version === version)
  }

  if (commit_sha) {
    releases = releases.filter((pr) => pr.commit_sha === commit_sha)
  }

  return ctx.json({
    ok: true,
    package_releases: releases.map((pr) => publicMapPackageRelease(pr, {
      include_ai_review: req.commonParams?.include_ai_review,
    })),
  })
})
