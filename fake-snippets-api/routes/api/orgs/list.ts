import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
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
  if (!ctx.auth && (!github_handle || !tscircuit_handle)) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "You must provide filtering parameters",
    })
  }
  console.log(2, github_handle, tscircuit_handle)
  const orgs = ctx.db.getOrgs(
    {
      github_handle,
      tscircuit_handle,
      ...(!github_handle && !tscircuit_handle
        ? { owner_account_id: ctx.auth?.account_id }
        : {}),
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
