import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["DELETE", "POST"],
  commonParams: z.object({
    org_invitation_id: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { org_invitation_id } = req.commonParams

  // Find the invitation
  const invitation = ctx.db.orgInvitations.find(
    (inv) => inv.org_invitation_id === org_invitation_id,
  )

  if (!invitation) {
    return ctx.error(404, {
      error_code: "invitation_not_found",
      message: "Invitation not found",
    })
  }

  // Check if org exists and user has permission
  const org = ctx.db.getOrg({ org_id: invitation.org_id }, ctx.auth)

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  if (!org.can_manage_org) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You do not have permission to manage this organization",
    })
  }

  // Check if invitation is already accepted
  if (invitation.is_accepted) {
    return ctx.error(400, {
      error_code: "invitation_already_accepted",
      message: "Cannot revoke an invitation that has already been accepted",
    })
  }

  // Revoke the invitation
  ctx.db.updateOrgInvitation(org_invitation_id, {
    is_revoked: true,
    is_pending: false,
  })

  return ctx.json({ ok: true })
})
