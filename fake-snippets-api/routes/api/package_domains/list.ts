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
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_domains: z.array(publicPackageDomainSchema),
  }),
})(async (req, ctx) => {
  const { package_build_id, package_release_id, package_id } = req.commonParams

  let domains = ctx.db.packageDomains

  if (package_build_id) {
    domains = domains.filter((d) => d.package_build_id === package_build_id)
  }

  if (package_release_id) {
    domains = domains.filter((d) => d.package_release_id === package_release_id)
  }

  if (package_id) {
    domains = domains.filter((d) => d.package_id === package_id)
  }

  // Sort by created_at descending and limit to 100
  domains = domains
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 100)

  return ctx.json({
    ok: true,
    package_domains: domains.map(publicMapPackageDomain),
  })
})
