import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import {
  orgAccountSchema,
  userPermissionsSchema,
} from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    org_id: z.string().optional(),
    org_name: z.string().optional(),
    member_id: z.string(),
  }),
  auth: "optional_session",
  jsonResponse: z.object({
    member: orgAccountSchema.merge(userPermissionsSchema),
  }),
})(async (req, ctx) => {
  const { org_id, org_name, member_id } = req.commonParams

  const org = ctx.db.getOrg(
    {
      org_id,
      org_name,
    },
    ctx.auth,
  )

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  const memberOrgAccount = ctx.db.getOrganizationAccount({
    org_id: org.org_id,
    account_id: member_id,
  })

  const memberOrg = ctx.db.getOrg(
    {
      org_id,
      org_name,
    },
    {
      account_id: member_id!,
    },
  )

  if (!memberOrgAccount) {
    return ctx.error(404, {
      error_code: "member_not_found",
      message: "Member not found in organization",
    })
  }

  return ctx.json({
    member: {
      ...memberOrg,
      ...memberOrgAccount,
    },
  })
})
