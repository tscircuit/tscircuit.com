import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    token: z.string(),
  }),
  auth: "none",
  jsonResponse: z.object({
    invitation: z.object({
      org_invitation_id: z.string(),
      invitee_email: z.string().nullable(),
      is_pending: z.boolean(),
      is_accepted: z.boolean(),
      is_revoked: z.boolean(),
      is_expired: z.boolean(),
      created_at: z.string(),
      expires_at: z.string(),
      org: z.object({
        org_id: z.string(),
        org_name: z.string().nullable(),
        org_display_name: z.string().optional(),
      }),
      inviter: z.object({
        github_username: z.string().nullable(),
        tscircuit_handle: z.string().nullable(),
      }),
    }),
  }),
})(async (req, ctx) => {
  const { token } = req.commonParams

  const invitation = ctx.db.getOrgInvitationByToken(token)

  if (!invitation) {
    return ctx.error(404, {
      error_code: "invitation_not_found",
      message: "Invitation not found",
    })
  }

  // Get organization details
  const org = ctx.db.organizations.find((o) => o.org_id === invitation.org_id)
  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  // Get inviter details
  const inviter = ctx.db.accounts.find(
    (acc) => acc.account_id === invitation.inviter_account_id,
  )

  // Compute is_expired dynamically
  const now = new Date()
  const is_expired =
    invitation.is_pending &&
    !invitation.is_revoked &&
    new Date(invitation.expires_at) < now

  return ctx.json({
    invitation: {
      org_invitation_id: invitation.org_invitation_id,
      invitee_email: invitation.invitee_email,
      is_pending: invitation.is_pending,
      is_accepted: invitation.is_accepted,
      is_revoked: invitation.is_revoked,
      is_expired,
      created_at: invitation.created_at,
      expires_at: invitation.expires_at,
      org: {
        org_id: org.org_id,
        org_name: org.tscircuit_handle,
        org_display_name: org.org_display_name,
      },
      inviter: {
        github_username: inviter?.github_username || null,
        tscircuit_handle: inviter?.tscircuit_handle || null,
      },
    },
  })
})
