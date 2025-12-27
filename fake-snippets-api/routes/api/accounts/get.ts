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
  commonParams: z.object({
    account_id: z.string().optional(),
    tscircuit_handle: z.string().optional(),
    github_username: z.string().optional(),
  }),
  jsonResponse: z.object({
    account: publicAccountSchema.extend({
      email: z.string().nullable().optional(),
    }),
  }),
})(async (req, ctx) => {
  let account: Account | undefined
  const { account_id, github_username, tscircuit_handle } = req.commonParams
  if (account_id) {
    const foundAccount = ctx.db.accounts.find(
      (acc: Account) => acc.account_id === account_id,
    )
    if (foundAccount) {
      account = { ...foundAccount, email: undefined }
    }
  } else if (tscircuit_handle) {
    const foundAccount = ctx.db.accounts.find(
      (acc: Account) =>
        acc.tscircuit_handle?.toLowerCase() === tscircuit_handle.toLowerCase(),
    )
    if (foundAccount) {
      account = { ...foundAccount, email: undefined }
    }
  } else if (github_username) {
    const foundAccount = ctx.db.accounts.find(
      (acc: Account) =>
        acc.github_username?.toLowerCase() === github_username.toLowerCase(),
    )
    if (foundAccount) {
      account = { ...foundAccount, email: undefined }
    }
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
