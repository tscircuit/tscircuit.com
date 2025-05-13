import { autoroutingBugReportSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    failed_to_route: z.enum(["true", "false"]).optional(),
    account_id: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    bug_reports: z.array(autoroutingBugReportSchema),
  }),
})(async (req, ctx) => {
  const { status, failed_to_route, account_id } = req.commonParams

  // Get all autorouting bug reports
  let bugReports = ctx.db.autoroutingBugReports

  // Filter by status if provided
  if (status) {
    bugReports = bugReports.filter((report) => report.status === status)
  }

  // Filter by failed_to_route if provided
  if (failed_to_route) {
    const failedToRoute = failed_to_route === "true"
    bugReports = bugReports.filter((report) => report.failed_to_route === failedToRoute)
  }

  // Filter by account_id if provided
  if (account_id) {
    bugReports = bugReports.filter((report) => report.account_id === account_id)
  }

  // If a user is authenticated and not an admin, only show their reports
  // In a real application, you'd have an admin role check here
  if (ctx.auth && !account_id) {
    bugReports = bugReports.filter((report) => report.account_id === ctx.auth.account_id)
  }

  // Sort by created_at in descending order (newest first)
  bugReports.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return ctx.json({
    ok: true,
    bug_reports: bugReports,
  })
})