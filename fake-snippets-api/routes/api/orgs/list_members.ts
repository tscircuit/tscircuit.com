import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import {
  accountSchema,
  userPermissionsSchema,
} from "fake-snippets-api/lib/db/schema"

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
    members: z.array(
      accountSchema
        .omit({ shippingInfo: true })
        .extend({
          joined_at: z.string(),
          user_permissions: userPermissionsSchema,
        }),
    ),
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

  const members = ctx.db.orgAccounts
    .map((m) => {
      if (m.org_id !== org.org_id) return undefined
      const account = ctx.db.getAccount(m.account_id)
      if (!account) return undefined
      const memberOrg = ctx.db.getOrg(
        {
          org_id: org.org_id,
          org_name: org.org_name,
        },
        {
          account_id: account.account_id,
        },
      )

      return {
        ...account,
        user_permissions: memberOrg,
        joined_at: m.created_at,
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
          org_name: org.org_name,
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
        },
      ]
    }
  }
  return ctx.json({
    members: fullMembers.map((m) => ({
      ...m,
      user_permissions: m.user_permissions ?? {
        can_manage_org: false,
        can_manage_package: false,
      },
    })),
  })
})
