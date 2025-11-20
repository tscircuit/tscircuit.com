import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { randomBytes } from "node:crypto"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  commonParams: z.object({
    org_id: z.string(),
    invitee_email: z.string().email(),
  }),
  auth: "session",
  jsonResponse: z.object({
    org_invitation_id: z.string(),
    invitation_token: z.string(),
    invitee_email: z.string(),
    expires_at: z.string(),
  }),
})(async (req, ctx) => {
  const { org_id, invitee_email } = req.commonParams

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

  // Check for duplicate pending invitation
  const existingInvitations = ctx.db.listOrgInvitations(org_id)
  const duplicatePending = existingInvitations.find(
    (inv) =>
      inv.invitee_email === invitee_email &&
      inv.is_pending &&
      !inv.is_revoked &&
      new Date(inv.expires_at) > new Date(),
  )

  if (duplicatePending) {
    return ctx.error(400, {
      error_code: "duplicate_pending_invitation",
      message: "A pending invitation for this email already exists",
    })
  }

  // Check if user is already a member
  const inviteeAccount = ctx.db.accounts.find(
    (acc) => acc.email === invitee_email,
  )
  if (inviteeAccount) {
    const existingMember = ctx.db.getOrganizationAccount({
      org_id,
      account_id: inviteeAccount.account_id,
    })
    if (existingMember) {
      return ctx.error(400, {
        error_code: "already_member",
        message: "This user is already a member of the organization",
      })
    }
  }

  // Generate secure token
  const invitation_token = randomBytes(32).toString("hex")

  // Create invitation
  const invitation = ctx.db.addOrgInvitation({
    org_id,
    invitee_email,
    inviter_account_id: ctx.auth!.account_id,
    invitation_token,
  })

  // Log email sending (fake API doesn't actually send emails)
  const origin = req.headers.get("origin") || "http://localhost:5173"
  const inviteUrl = `${origin}/orgs/invite?token=${invitation_token}`
  console.log(`[FAKE EMAIL] Sending invitation to ${invitee_email}`)
  console.log(
    `[FAKE EMAIL] Organization: ${org.tscircuit_handle || org.org_id}`,
  )
  console.log(`[FAKE EMAIL] Invitation URL: ${inviteUrl}`)
  console.log(`[FAKE EMAIL] Expires: ${invitation.expires_at}`)

  return ctx.json({
    org_invitation_id: invitation.org_invitation_id,
    invitation_token: invitation.invitation_token,
    invitee_email: invitee_email,
    expires_at: invitation.expires_at,
  })
})
