import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { accountSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z
    .object({
      org_id: z.string(),
    })
    .or(
      z.object({
        name: z.string(),
      }),
    ),
  auth: "optional_session",
  jsonResponse: z.object({
    members: z.array(accountSchema),
  }),
})(async (req, ctx) => {
  const params = req.commonParams as { org_id?: string; name?: string }

  const org = ctx.db.getOrg(
    {
      org_id: params.org_id,
      org_name: params.name,
    },
    ctx.auth,
  )

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  // Allow viewing members for public organizations (non-personal orgs)
  // Only require permission check for personal orgs or if trying to manage
  if (org.is_personal_org && !org.can_manage_org) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You do not have permission to manage this organization",
    })
  }

  const members = ctx.db.orgAccounts
    .map((m) => {
      if (m.org_id == org.org_id) return ctx.db.getAccount(m.account_id)
      return undefined
    })
    .filter(
      (member): member is NonNullable<typeof member> => member !== undefined,
    )

  const hasOwner = members.some((m) => m?.account_id === org.owner_account_id)
  let fullMembers = members

  if (!hasOwner) {
    const owner = ctx.db.accounts.find(
      (acc) => acc.account_id === org.owner_account_id,
    )
    if (owner) {
      fullMembers = [...members, owner]
    }
  }

  return ctx.json({ members: fullMembers })
})
