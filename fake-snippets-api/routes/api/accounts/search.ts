import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { accountSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    query: z.string(),
    limit: z.number().optional().default(50),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    accounts: z.array(accountSchema),
  }),
})(async (req, ctx) => {
  const { query, limit } = req.jsonBody
  const accounts = ctx.db.searchAccounts(query, limit)
  return ctx.json({ accounts, ok: true })
})
