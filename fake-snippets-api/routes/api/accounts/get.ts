import { type Account, accountSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  jsonBody: z.object({
    github_username: z.string(),
  }),
  jsonResponse: z.object({
    account: accountSchema,
  }),
})(async (req, ctx) => {
  let account: Account | undefined

  if (req.method === "POST") {
    const { github_username } = req.jsonBody
    account = ctx.db.accounts.find(
      (acc: Account) =>
        acc.github_username.toLowerCase() === github_username.toLowerCase(),
    )
  } else {
    account = ctx.db.getAccount(ctx.auth.account_id)
  }

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  return ctx.json({ account })
})
