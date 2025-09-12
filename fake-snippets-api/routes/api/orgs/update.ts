import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  commonParams: z
    .object({
      org_id: z.string(),
    })
    .and(
      z.object({
        name: z.string().optional(),
      }),
    ),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { org_id, name } = req.commonParams as { org_id: string; name?: string }

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

  if (!name) {
    return ctx.json({ org: publicMapOrg(org) })
  }

  const duplicate = ctx.db.organizations.find(
    (org) => org.github_handle === name && org.org_id !== org_id,
  )

  if (duplicate) {
    return ctx.error(400, {
      error_code: "org_already_exists",
      message: "An organization with this name already exists",
    })
  }

  const updatedOrg = {
    ...org,
    github_handle: name,
  }

  return ctx.json({
    org: publicMapOrg({ ...updatedOrg, can_manage_org: true }),
  })
})
