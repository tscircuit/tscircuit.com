import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { packageSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "optional_session",
  jsonBody: z.object({
    query: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(packageSchema),
  }),
})(async (req, ctx) => {
  const { query } = req.jsonBody
  const auth = "auth" in ctx && ctx.auth ? ctx.auth : null
  const packages = ctx.db.searchPackages(query, auth?.account_id)
  return ctx.json({ packages, ok: true })
})
