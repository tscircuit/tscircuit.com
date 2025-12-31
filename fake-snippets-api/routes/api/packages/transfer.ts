import { z } from "zod"
import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
    target_org_id: z.string(),
  }),
  jsonResponse: z.object({
    package: packageSchema,
  }),
})(async (req, ctx) => {
  const { package_id, target_org_id } = req.jsonBody

  const packageIndex = ctx.db.packages.findIndex(
    (pkg) => pkg.package_id === package_id,
  )

  if (packageIndex === -1) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const pkg = ctx.db.packages[packageIndex]

  if (pkg.owner_org_id === target_org_id) {
    return ctx.error(400, {
      error_code: "package_already_owned",
      message: "Package is already owned by that organization",
    })
  }

  const canManagePackage = ctx.db
    .getState()
    .orgAccounts.some(
      (oa) =>
        oa.account_id === ctx.auth.account_id && oa.org_id === pkg.owner_org_id,
    )

  if (!canManagePackage) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to transfer this package",
    })
  }

  const targetOrg = ctx.db.getOrg({ org_id: target_org_id })

  if (!targetOrg) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  const isMemberOfTargetOrg =
    ctx.auth.personal_org_id === target_org_id ||
    (ctx.auth.orgs?.some((org) => org.org_id === target_org_id) ?? false)

  if (!isMemberOfTargetOrg) {
    return ctx.error(403, {
      error_code: "forbidden",
      message:
        "You must be a member of the organization to transfer a package to it",
    })
  }

  const updatedPackage = ctx.db.updatePackage(package_id, {
    owner_org_id: target_org_id,
    github_repo_full_name: null,
    updated_at: new Date().toISOString(),
  })

  if (!updatedPackage) {
    return ctx.error(500, {
      error_code: "transfer_failed",
      message: "Failed to transfer package",
    })
  }

  return ctx.json({
    package: publicMapPackage({
      ...updatedPackage,
      org_owner_tscircuit_handle: targetOrg.tscircuit_handle ?? null,
    }),
  })
})
