import { autoroutingBugReportSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    failed_to_route: z.boolean().default(false),
    circuit_json: z.any().nullable().optional(),
    simple_route_json: z.any().nullable().optional(),
    description: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    bug_report: autoroutingBugReportSchema,
  }),
})(async (req, ctx) => {
  const {
    failed_to_route = false,
    circuit_json = null,
    simple_route_json = null,
    description = "",
  } = req.jsonBody

  // Validate that at least one of circuit_json or simple_route_json is provided
  if (!circuit_json && !simple_route_json) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "At least one of circuit_json or simple_route_json must be provided",
    })
  }

  const timestamp = new Date().toISOString()

  try {
    // Create the autorouting bug report
    const bugReport = ctx.db.addAutoroutingBugReport({
      account_id: ctx.auth.account_id,
      failed_to_route,
      circuit_json,
      simple_route_json,
      created_at: timestamp,
      description,
      status: "open",
    })

    return ctx.json({
      ok: true,
      bug_report: bugReport,
    })
  } catch (error) {
    return ctx.error(500, {
      error_code: "bug_report_creation_failed",
      message: `Failed to create autorouting bug report: ${error}`,
    })
  }
})