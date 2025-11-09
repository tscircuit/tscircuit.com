import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import {
  Account,
  accountSchema,
  publicAccountSchema,
} from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "session",
  jsonBody: z.object({
    github_username: z.string(),
  }),
  jsonResponse: z.union([
    z.object({ account: accountSchema }),
    z.object({ account: publicAccountSchema }),
  ]),
})(async (req, ctx) => {
  let account: Account | undefined
  let isOwnAccount = false

  if (req.method === "POST") {
    const { github_username } = req.jsonBody
    account = ctx.db.accounts.find(
      (acc: Account) =>
        acc.github_username.toLowerCase() === github_username.toLowerCase(),
    )
    isOwnAccount = account?.account_id === ctx.auth.account_id
  } else {
    account = ctx.db.getAccount(ctx.auth.account_id)
    isOwnAccount = true
  }

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  if (isOwnAccount) {
    return ctx.json({ account })
  } else {
    const { email, shippingInfo, ...publicAccount } = account
    return ctx.json({ account: publicAccount })
  }
})
