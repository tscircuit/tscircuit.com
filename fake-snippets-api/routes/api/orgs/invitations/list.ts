import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    org_id: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    invitations: z.array(
      z.object({
        org_invitation_id: z.string(),
        invitee_email: z.string().nullable(),
        is_pending: z.boolean(),
        is_accepted: z.boolean(),
        is_expired: z.boolean(),
        is_revoked: z.boolean(),
        created_at: z.string(),
        expires_at: z.string(),
        accepted_at: z.string().nullable(),
        inviter: z.object({
          account_id: z.string(),
          github_username: z.string().nullable(),
          tscircuit_handle: z.string().nullable(),
        }),
      }),
    ),
  }),
})(async (req, ctx) => {
  const { org_id } = req.commonParams

  // Check if org exists and user has permission
  const org = ctx.db.getOrg({ org_id }, ctx.auth)

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

  // Get all invitations for this org
  const invitations = ctx.db.listOrgInvitations(org_id)

  // Compute is_expired for each invitation
  const now = new Date()
  const invitationsWithExpiry = invitations.map((inv) => {
    const is_expired = new Date(inv.expires_at) < now && inv.is_pending

    // Get inviter details
    const inviter = ctx.db.accounts.find(
      (acc) => acc.account_id === inv.inviter_account_id,
    )

    return {
      org_invitation_id: inv.org_invitation_id,
      invitee_email: inv.invitee_email,
      is_pending: inv.is_pending,
      is_accepted: inv.is_accepted,
      is_expired,
      is_revoked: inv.is_revoked,
      created_at: inv.created_at,
      expires_at: inv.expires_at,
      accepted_at: inv.accepted_at,
      inviter: {
        account_id: inv.inviter_account_id,
        github_username: inviter?.github_username || null,
        tscircuit_handle: inviter?.tscircuit_handle || null,
      },
    }
  })

  // Sort by created_at DESC (newest first)
  invitationsWithExpiry.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return ctx.json({
    invitations: invitationsWithExpiry,
  })
})
