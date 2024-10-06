import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import ms from "ms"
import { SignJWT } from "jose"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z
    .object({
      account_id: z.string(),
    })
    .or(
      z.object({
        github_username: z.string(),
      }),
    ),
  jsonResponse: z.object({
    session: z.object({
      session_id: z.string(),
      account_id: z.string(),
      expires_at: z.string(),
      is_cli_session: z.boolean(),
      token: z.string(),
    }),
  }),
})(async (req, ctx) => {
  let account
  if ("account_id" in req.jsonBody) {
    account = ctx.db.getAccount(req.jsonBody.account_id)
  } else {
    account = ctx.db.getAccount(req.jsonBody.github_username)
  }

  if (!account) {
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  const new_session = ctx.db.createSession({
    expires_at: new Date(Date.now() + ms("60 day")).toISOString(),
    account_id: account.account_id,
    is_cli_session: false,
  })

  const token = await new SignJWT({
    account_id: account.account_id,
    session_id: new_session.session_id,
    github_username: account.github_username,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(new Date(Date.now() + ms("60 day")).toISOString())
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || ""))

  return ctx.json({
    session: {
      ...new_session,
      token,
    },
  })
})
