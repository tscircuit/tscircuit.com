import { autoroutingBugReportSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    bug_report_id: z.string(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    bug_report: autoroutingBugReportSchema,
  }),
})(async (req, ctx) => {
  const { bug_report_id } = req.commonParams

  // Find the bug report by ID
  const bugReport = ctx.db.autoroutingBugReports.find(
    (report) => report.bug_report_id === bug_report_id
  )

  if (!bugReport) {
    return ctx.error(404, {
      error_code: "bug_report_not_found",
      message: `Bug report not found with ID: ${bug_report_id}`,
    })
  }

  // Check permissions - only the owner or admin should access (in a real app you'd have admin roles)
  if (ctx.auth && bugReport.account_id !== ctx.auth.account_id) {
    // Simple check - in real app you'd check if user is an admin
    const isAdmin = false
    
    if (!isAdmin) {
      return ctx.error(403, {
        error_code: "access_denied",
        message: "You don't have permission to access this bug report",
      })
    }
  }

  return ctx.json({
    ok: true,
    bug_report: bugReport,
  })
})