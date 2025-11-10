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
    github_username: z.string().optional(),
    tscircuit_handle: z.string().optional(),
  }),
  jsonResponse: z.object({
    account: publicAccountSchema.extend({
      email: z.string().nullable().optional(),
    }),
  }),
})(async (req, ctx) => {
  let account: Account | undefined
  const { github_username, tscircuit_handle } = req.commonParams
  if (github_username || tscircuit_handle) {
    const lookupByHandle = (predicate: (acc: Account) => boolean) => {
      const foundAccount = ctx.db.accounts.find(predicate)
      if (foundAccount) {
        return { ...foundAccount, email: undefined }
      }
      return undefined
    }

    account =
      (tscircuit_handle &&
        lookupByHandle(
          (acc) =>
            acc.tscircuit_handle?.toLowerCase() ===
            tscircuit_handle.toLowerCase(),
        )) ||
      (github_username &&
        lookupByHandle(
          (acc) =>
            acc.github_username?.toLowerCase() ===
            github_username.toLowerCase(),
        )) ||
      undefined
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
