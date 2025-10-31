import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z.object({
    name: z
      .string()
      .min(5)
      .max(40)
      .regex(
        /^[a-z0-9_-]+$/,
        "Name must contain only lowercase letters, numbers, underscores, and hyphens",
      )
      .regex(/^[a-z0-9]/, "Name must start with a letter or number")
      .regex(/[a-z0-9]$/, "Name must end with a letter or number"),
    display_name: z.string().min(5).max(40).optional(),
    github_handle: z.string().optional(),
    tscircuit_handle: z
      .string()
      .regex(
        /^[0-9A-Za-z_-]+$/,
        "tscircuit_handle may only contain letters, numbers, underscores, and hyphens",
      )
      .optional(),
  }),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { github_handle, name, display_name, tscircuit_handle } =
    req.commonParams

  const existing = ctx.db.getOrg({ org_name: name })

  if (existing) {
    return ctx.error(400, {
      error_code: "org_already_exists",
      message: "An organization with this name already exists",
    })
  }

  const newOrg = {
    owner_account_id: ctx.auth.account_id,
    name,
    org_display_name: display_name,
    created_at: new Date(),
    can_manage_org: true,
    ...(github_handle ? { github_handle } : {}),
    ...((tscircuit_handle ?? github_handle)
      ? { tscircuit_handle: tscircuit_handle ?? github_handle }
      : {}),
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
