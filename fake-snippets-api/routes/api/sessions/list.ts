import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  auth: "session",
  methods: ["GET", "POST"],
  commonParams: z.object({
    is_cli_session: z.boolean().optional(),
  }),
  jsonResponse: z.object({
    sessions: z.array(
      z.object({
        session_id: z.string(),
        expires_at: z.string(),
      }),
    ),
  }),
})(async (req, ctx) => {
  const sessions = ctx.db.getSessions({
    account_id: ctx.auth.account_id,
    is_cli_session: req.commonParams.is_cli_session,
  })

  return ctx.json({
    sessions: sessions.map(({ session_id, expires_at }) => ({
      session_id,
      expires_at,
    })),
  })
})
