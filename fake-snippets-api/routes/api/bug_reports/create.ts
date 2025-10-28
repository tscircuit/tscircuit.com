import { bugReportSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const requestSchema = z
  .object({
    text: z.string().optional(),
    is_auto_deleted: z.boolean().optional(),
    delete_at: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_auto_deleted && !data.delete_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "delete_at is required when is_auto_deleted is true",
        path: ["delete_at"],
      })
    }
  })

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: requestSchema,
  jsonResponse: z.object({
    ok: z.literal(true),
    bug_report: bugReportSchema,
  }),
})(async (req, ctx) => {
  const { text, is_auto_deleted = false, delete_at } = req.jsonBody

  const bugReport = ctx.db.addBugReport({
    reporter_account_id: ctx.auth.account_id,
    text: text ?? null,
    is_auto_deleted,
    delete_at: is_auto_deleted ? delete_at : null,
  })

  return ctx.json({
    ok: true,
    bug_report: bugReport,
  })
})
