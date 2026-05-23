import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { SignJWT } from "jose"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  jsonBody: z.object({
    github_username: z.string(),
  }),
  jsonResponse: z.object({
    session: z.object({
      token: z.string(),
      account_id: z.string(),
      session_id: z.string(),
    }),
  }),
})(async (req, ctx) => {
  const { github_username } = req.jsonBody
  const state = ctx.db.getState()

  // Find or create account
  let account = state.accounts.find(
    (acc: any) =>
      acc.github_username?.toLowerCase() === github_username.toLowerCase(),
  )

  if (!account) {
    account = ctx.db.addAccount({
      github_username,
      tscircuit_handle: github_username,
    })
  }

  const session = ctx.db.createSession({
    account_id: account.account_id,
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    is_cli_session: false,
  })

  const token = await new SignJWT({
    session_id: session.session_id,
    account_id: account.account_id,
    github_username: account.github_username,
    tscircuit_handle: account.tscircuit_handle,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(new TextEncoder().encode("dummy_secret"))

  return ctx.json({
    session: {
      token,
      account_id: account.account_id,
      session_id: session.session_id,
    },
  })
})
