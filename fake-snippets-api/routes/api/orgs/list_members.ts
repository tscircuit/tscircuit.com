import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { memberSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    org_id: z.string(),
  }),
  auth: "optional_session",
  jsonResponse: z.object({
    org_members: z.array(memberSchema),
  }),
})(async (req, ctx) => {
  const params = req.commonParams as { org_id?: string }

  const org = ctx.db.getOrg(
    {
      org_id: params.org_id,
    },
    ctx.auth,
  )

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  const currentAccountId = ctx.auth?.account_id
  const isCurrentUserMember =
    currentAccountId &&
    (currentAccountId === org.owner_account_id ||
      ctx.db.orgAccounts.some(
        (m) => m.org_id === org.org_id && m.account_id === currentAccountId,
      ))

  const getPersonalOrgAvatarUrl = (account: {
    personal_org_id: string | null
  }) => {
    if (!account.personal_org_id) return null
    const personalOrg = ctx.db.organizations.find(
      (o) => o.org_id === account.personal_org_id,
    )
    return personalOrg?.avatar_url ?? null
  }

  const members = ctx.db.orgAccounts
    .map((m) => {
      if (m.org_id !== org.org_id) return undefined
      const account = ctx.db.getAccount(m.account_id)
      if (!account) return undefined
      const memberOrg = ctx.db.getOrg(
        {
          org_id: org.org_id,
        },
        {
          account_id: account.account_id,
        },
      )

      return {
        ...account,
        user_permissions: memberOrg,
        joined_at: m.created_at,
        avatar_url: getPersonalOrgAvatarUrl(account),
      }
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
      const memberOrg = ctx.db.getOrg(
        {
          org_id: org.org_id,
        },
        {
          account_id: owner.account_id,
        },
      )
      fullMembers = [
        ...members,
        {
          ...owner,
          user_permissions: memberOrg,
          joined_at: org.created_at,
          avatar_url: getPersonalOrgAvatarUrl(owner),
        },
      ]
    }
  }
  return ctx.json({
    org_members: fullMembers.map((m) => ({
      ...m,
      email: isCurrentUserMember ? m.email : undefined,
      org_member_permissions: m.user_permissions ?? {
        can_manage_org: false,
        can_manage_package: false,
      },
    })),
  })
})
