import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  auth: "session",
  methods: ["POST", "DELETE"],
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { session_id } = ctx.auth

  const deleted = ctx.db.deleteSession(session_id)

  if (!deleted) {
    return ctx.error(404, {
      error_code: "session_not_found",
      message: "Session not found",
    })
  }

  return ctx.json({
    ok: true,
  })
})
