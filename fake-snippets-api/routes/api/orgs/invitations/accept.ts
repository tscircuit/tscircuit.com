import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  commonParams: z.object({
    invitation_token: z.string(),
  }),
  auth: "session",
  jsonResponse: z.object({
    org_account_id: z.string(),
    org: z.object({
      org_id: z.string(),
      org_name: z.string().nullable(),
      org_display_name: z.string().optional(),
    }),
  }),
})(async (req, ctx) => {
  const { invitation_token } = req.commonParams

  // Find the invitation
  const invitation = ctx.db.getOrgInvitationByToken(invitation_token)

  if (!invitation) {
    return ctx.error(404, {
      error_code: "invitation_not_found",
      message: "Invalid invitation link",
    })
  }

  // Check if invitation is revoked
  if (invitation.is_revoked) {
    return ctx.error(400, {
      error_code: "invitation_revoked",
      message: "This invitation was cancelled",
    })
  }

  // Check if invitation is already accepted
  if (invitation.is_accepted) {
    return ctx.error(400, {
      error_code: "invitation_already_accepted",
      message: "You've already joined this organization",
    })
  }

  // Check if invitation is expired
  const now = new Date()
  if (new Date(invitation.expires_at) < now) {
    return ctx.error(400, {
      error_code: "invitation_expired",
      message: `This invitation expired on ${new Date(invitation.expires_at).toLocaleDateString()}`,
    })
  }

  // Get current user's account
  const currentAccount = ctx.db.accounts.find(
    (acc) => acc.account_id === ctx.auth!.account_id,
  )

  if (!currentAccount) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Your account was not found",
    })
  }

  // Check if user's email matches invitation email
  if (
    invitation.invitee_email &&
    currentAccount.email !== invitation.invitee_email
  ) {
    return ctx.error(403, {
      error_code: "email_mismatch",
      message: `This invite is for ${invitation.invitee_email}. Please log in with that email.`,
    })
  }

  // Check if user is already a member
  const existingMember = ctx.db.getOrganizationAccount({
    org_id: invitation.org_id,
    account_id: currentAccount.account_id,
  })

  if (existingMember) {
    return ctx.error(400, {
      error_code: "already_member",
      message: "You're already a member of this organization",
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

  // Add user to organization
  const orgAccount = ctx.db.addOrganizationAccount({
    org_id: invitation.org_id,
    account_id: currentAccount.account_id,
    is_owner: false,
  })

  // Mark invitation as accepted
  ctx.db.updateOrgInvitation(invitation.org_invitation_id, {
    is_pending: false,
    is_accepted: true,
    accepted_at: new Date().toISOString(),
    accepted_by_account_id: currentAccount.account_id,
  })

  return ctx.json({
    org_account_id: orgAccount.org_account_id,
    org: {
      org_id: org.org_id,
      org_name: org.tscircuit_handle,
      org_display_name: org.org_display_name,
    },
  })
})
