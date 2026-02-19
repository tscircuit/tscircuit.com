import { publicPackageDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackageDomain } from "fake-snippets-api/lib/public-mapping/public-map-package-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    package_build_id: z.string().optional(),
    package_release_id: z.string().optional(),
    package_id: z.string().optional(),
    filter_preset: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_domains: z.array(publicPackageDomainSchema),
  }),
})(async (req, ctx) => {
  const { package_build_id, package_release_id, package_id, filter_preset } =
    req.commonParams

  if (filter_preset && !package_id) {
    return ctx.error(400, {
      error_code: "missing_parameter",
      message: "package_id is required when filter_preset is provided",
    })
  }

  let domains = ctx.db.packageDomains

  if (package_build_id) {
    domains = domains.filter((d) => d.package_build_id === package_build_id)
  }

  if (package_release_id) {
    domains = domains.filter((d) => d.package_release_id === package_release_id)
  }

  if (package_id) {
    domains = domains.filter((d) => {
      if (d.package_id === package_id) {
        return true
      }

      if (d.package_release_id) {
        const release = ctx.db.packageReleases.find(
          (r) => r.package_release_id === d.package_release_id,
        )
        return release?.package_id === package_id
      }

      if (d.package_build_id) {
        const build = ctx.db.packageBuilds.find(
          (b) => b.package_build_id === d.package_build_id,
        )

        if (!build) {
          return false
        }

        const release = ctx.db.packageReleases.find(
          (r) => r.package_release_id === build.package_release_id,
        )

        return release?.package_id === package_id
      }

      return false
    })
  }

  // Sort by created_at descending and limit to 100
  domains = domains
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 100)

  const filteredDomains = filter_preset
    ? (() => {
        const latestPackageReleaseDomain = domains.find(
          (packageDomain) => packageDomain.points_to === "package_release",
        )
        const latestPackageBuildDomain = domains.find(
          (packageDomain) => packageDomain.points_to === "package_build",
        )
        const taggedPackageReleaseDomains = domains.filter(
          (packageDomain) =>
            packageDomain.points_to === "package_release_with_tag",
        )

        return [
          ...taggedPackageReleaseDomains,
          ...[latestPackageReleaseDomain, latestPackageBuildDomain].filter(
            (domain): domain is (typeof domains)[number] =>
              domain !== undefined,
          ),
        ]
      })()
    : domains

  return ctx.json({
    ok: true,
    package_domains: filteredDomains.map(publicMapPackageDomain),
  })
})
