import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  commonParams: z.object({
    github_handle: z.string().optional(),
    tscircuit_handle: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    orgs: z.array(publicOrgSchema),
  }),
})(async (req, ctx) => {
  const { github_handle, tscircuit_handle } = req.commonParams
  if (!github_handle && !tscircuit_handle) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "You must provide filtering parameters",
    })
  }
  const orgs = ctx.db.getOrgs(
    {
      owner_account_id: ctx.auth?.account_id,
      github_handle,
      tscircuit_handle,
    },
    {
      account_id: ctx.auth?.account_id,
    },
  )
  return ctx.json({
    ok: true,
    orgs: orgs.map((org) => publicMapOrg(org)),
  })
})
