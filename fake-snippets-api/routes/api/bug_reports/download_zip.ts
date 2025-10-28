import JSZip from "jszip"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  queryParams: z.object({
    bug_report_id: z.string().uuid(),
  }),
  rawResponse: true,
})(async (req, ctx) => {
  const { bug_report_id } = req.query

  const bugReport = ctx.db.getBugReportById(bug_report_id)
  if (!bugReport) {
    return ctx.error(404, {
      error_code: "bug_report_not_found",
      message: "Bug report not found",
    })
  }

  if (bugReport.reporter_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "bug_report_forbidden",
      message: "You do not have access to this bug report",
    })
  }

  const bugReportFiles = ctx.db.getBugReportFilesByBugReportId(bug_report_id)

  const zip = new JSZip()

  for (const file of bugReportFiles) {
    if (file.is_text) {
      zip.file(file.file_path, file.content_text ?? "", { binary: false })
    } else {
      const bytes = file.content_bytes ?? new Uint8Array()
      zip.file(file.file_path, bytes, { binary: true })
    }
  }

  const zipContent = await zip.generateAsync({ type: "arraybuffer" })

  return new Response(zipContent, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bug-report-${bug_report_id}.zip"`,
    },
  })
})
