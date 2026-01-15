import { z } from "zod"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string(),
  }),
  jsonResponse: z.object({
    start_github_sync_result: z.object({
      ok: z.boolean(),
      message: z.string(),
    }),
  }),
})(async (req, ctx) => {
  const { package_id } = req.jsonBody

  const existingPackage = await ctx.db.getPackageById(package_id)

  if (!existingPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const canManagePackage =
    existingPackage.owner_org_id === ctx.auth.personal_org_id ||
    ctx.db
      .getState()
      .orgAccounts.some(
        (oa) =>
          oa.account_id === ctx.auth.account_id &&
          oa.org_id === existingPackage.owner_org_id,
      )

  if (!canManagePackage) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to sync this package",
    })
  }

  if (!existingPackage.github_repo_full_name) {
    return ctx.error(400, {
      error_code: "github_not_connected",
      message: "This package is not connected to a GitHub repository",
    })
  }

  if (!existingPackage.github_installation_id) {
    return ctx.error(400, {
      error_code: "github_installation_missing",
      message:
        "GitHub installation is missing. Please reconnect the repository.",
    })
  }

  ctx.logger.info("Queued GitHub sync job", {
    package_id,
    repository: existingPackage.github_repo_full_name,
  })

  return ctx.json({
    start_github_sync_result: {
      ok: true,
      message: "GitHub sync job queued successfully",
    },
  })
})
