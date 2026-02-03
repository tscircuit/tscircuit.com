import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    query: z.string(),
    limit: z.number().optional().default(50),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    orgs: z.array(publicOrgSchema),
  }),
})(async (req, ctx) => {
  const { query, limit } = req.jsonBody
  const orgs = ctx.db.searchOrgs(query, limit, ctx.auth)
  return ctx.json({ orgs: orgs.map((org) => publicMapOrg(org)), ok: true })
})
