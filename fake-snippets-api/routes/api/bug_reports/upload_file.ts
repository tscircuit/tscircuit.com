import { Buffer } from "node:buffer"
import { bugReportFileResponseSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { normalizeProjectFilePathAndValidate } from "fake-snippets-api/utils/normalizeProjectFilePath"
import { z } from "zod"

const requestSchema = z
  .object({
    bug_report_id: z.string().uuid(),
    file_path: z.string(),
    content_mimetype: z.string().optional(),
    content_text: z.string().optional(),
    content_base64: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.content_text !== undefined && data.content_base64 !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either content_text or content_base64, not both",
        path: ["content_text"],
      })
    }
  })

const inferMimetype = (filePath: string, provided?: string) => {
  if (provided) return provided

  const lowerPath = filePath.toLowerCase()
  if (lowerPath.endsWith(".ts") || lowerPath.endsWith(".tsx")) {
    return "text/typescript"
  }
  if (lowerPath.endsWith(".js")) return "application/javascript"
  if (lowerPath.endsWith(".json")) return "application/json"
  if (lowerPath.endsWith(".md")) return "text/markdown"
  if (lowerPath.endsWith(".html")) return "text/html"
  if (lowerPath.endsWith(".css")) return "text/css"
  if (lowerPath.endsWith(".txt")) return "text/plain"
  return "application/octet-stream"
}

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: requestSchema,
  jsonResponse: z.object({
    ok: z.literal(true),
    bug_report_file: bugReportFileResponseSchema,
  }),
})(async (req, ctx) => {
  const {
    bug_report_id,
    file_path,
    content_mimetype,
    content_text,
    content_base64,
  } = req.jsonBody

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
      message: "You do not have access to modify this bug report",
    })
  }

  let normalizedPath: string
  try {
    normalizedPath = normalizeProjectFilePathAndValidate(file_path)
  } catch (error) {
    return ctx.error(400, {
      error_code: "invalid_file_path",
      message: error instanceof Error ? error.message : "Invalid file path",
    })
  }

  const mimeType = inferMimetype(normalizedPath, content_mimetype)
  const hasBase64 = content_base64 !== undefined
  const hasText = content_text !== undefined
  const isTextUpload = hasText || !hasBase64
  const storedText = isTextUpload ? (content_text ?? "") : null
  const storedBytes =
    isTextUpload || !hasBase64
      ? null
      : Buffer.from(content_base64 ?? "", "base64")

  const bugReportFile = ctx.db.addBugReportFile({
    bug_report_id,
    file_path: normalizedPath,
    content_mimetype: mimeType,
    is_text: isTextUpload,
    content_text: storedText,
    content_bytes: storedBytes,
  })

  return ctx.json({
    ok: true,
    bug_report_file: {
      bug_report_file_id: bugReportFile.bug_report_file_id,
      bug_report_id: bugReportFile.bug_report_id,
      file_path: bugReportFile.file_path,
      content_mimetype: bugReportFile.content_mimetype,
      is_text: bugReportFile.is_text,
      created_at: bugReportFile.created_at,
    },
  })
})
