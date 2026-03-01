import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_domain_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { package_domain_id } = req.jsonBody

  const domain = ctx.db.getPackageDomainById(package_domain_id)

  if (!domain) {
    return ctx.error(404, {
      error_code: "package_domain_not_found",
      message: "Package domain not found",
    })
  }

  let packageId = domain.package_id

  if (!packageId && domain.package_release_id) {
    const release = ctx.db.getPackageReleaseById(domain.package_release_id)
    packageId = release?.package_id
  }

  if (!packageId && domain.package_build_id) {
    const build = ctx.db.getPackageBuildById(domain.package_build_id)
    if (build) {
      const release = ctx.db.getPackageReleaseById(build.package_release_id)
      packageId = release?.package_id
    }
  }

  if (packageId) {
    const pkg = ctx.db.packages.find((p) => p.package_id === packageId)
    if (pkg) {
      const hasPermission =
        pkg.creator_account_id === ctx.auth.account_id ||
        ctx.db
          .getState()
          .orgAccounts.some(
            (oa) =>
              oa.account_id === ctx.auth.account_id &&
              oa.org_id === pkg.owner_org_id,
          )
      if (!hasPermission) {
        return ctx.error(403, {
          error_code: "forbidden",
          message: "You don't have permission to delete this package domain",
        })
      }
    }
  }

  ctx.db.deletePackageDomain(package_domain_id)

  return ctx.json({
    ok: true,
  })
})
