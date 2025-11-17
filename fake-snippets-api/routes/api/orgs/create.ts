import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import {
  publicOrgSchema,
  tscircuitHandleSchema,
} from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z
    .object({
      display_name: z.string().min(5).max(40).optional(),
      tscircuit_handle: tscircuitHandleSchema.optional(),
      name: tscircuitHandleSchema.optional(),
    })
    .refine((data) => data.tscircuit_handle || data.name, {
      message: "Either tscircuit_handle or name is required",
    }),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { display_name, tscircuit_handle, name } = req.commonParams
  const handle = tscircuit_handle || name

  const existing = ctx.db.getOrg({ tscircuit_handle: handle })

  if (existing) {
    return ctx.error(400, {
      error_code: "org_already_exists",
      message: "An organization with this name already exists",
    })
  }

  const newOrg = {
    owner_account_id: ctx.auth.account_id,
    org_display_name: display_name,
    created_at: new Date(),
    can_manage_org: true,
    tscircuit_handle: handle,
  }

  const org = ctx.db.addOrganization(newOrg)

  ctx.db.addOrganizationAccount({
    org_id: org.org_id,
    account_id: ctx.auth.account_id,
    is_owner: true,
  })

  const fullOrg = ctx.db.getOrg({ org_id: org.org_id }, ctx.auth)
  return ctx.json({
    org: publicMapOrg(fullOrg!),
  })
})
