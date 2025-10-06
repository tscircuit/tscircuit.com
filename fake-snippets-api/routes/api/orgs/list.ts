import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    github_handle: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    orgs: z.array(publicOrgSchema),
  }),
})(async (req, ctx) => {
  const { github_handle } = req.commonParams
  
  // If github_handle is provided, fetch orgs for that user
  // Otherwise, fetch orgs for the authenticated user (if logged in)
  const filters = github_handle
    ? { github_handle }
    : ctx.auth?.account_id
      ? { owner_account_id: ctx.auth.account_id }
      : {}
  
  const orgs = ctx.db.getOrgs(
    filters,
    {
      account_id: ctx.auth?.account_id,
    },
  )
  return ctx.json({
    ok: true,
    orgs: orgs.map((org) => publicMapOrg(org)),
  })
})
