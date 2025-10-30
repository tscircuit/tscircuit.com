import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  commonParams: z
    .object({ org_id: z.string() })
    .or(z.object({ org_name: z.string() }))
    .or(z.object({ github_handle: z.string() }))
    .or(z.object({ tscircuit_handle: z.string() })),
  auth: "optional_session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const params = req.commonParams as {
    org_id?: string
    org_name?: string
    github_handle?: string
    tscircuit_handle?: string
  }

  const org = ctx.db.getOrg(
    {
      org_id: params.org_id,
      org_name: params.org_name,
      github_handle: params.github_handle,
      tscircuit_handle: params.tscircuit_handle,
    },
    ctx.auth,
  )

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }
  return ctx.json({ org: publicMapOrg(org) })
})
