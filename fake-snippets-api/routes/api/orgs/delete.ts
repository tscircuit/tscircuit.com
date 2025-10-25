import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "DELETE"],
  commonParams: z.object({
    org_id: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
  }),
})(async (req, ctx) => {
  const { org_id } = req.commonParams

  const org = ctx.db.getOrg({ org_id }, ctx.auth)

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  if (org.owner_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "Only the organization owner can delete the organization",
    })
  }

  if (org.is_personal_org) {
    return ctx.error(400, {
      error_code: "cannot_delete_personal_org",
      message: "Personal organizations cannot be deleted",
    })
  }

  const deleted = ctx.db.deleteOrganization(org_id)

  if (!deleted) {
    return ctx.error(500, {
      error_code: "delete_failed",
      message: "Failed to delete organization",
    })
  }

  return ctx.json({
    success: true,
  })
})
