import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  circuit_json: z.array(z.record(z.any())),
})

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: requestSchema,
  jsonResponse: z.object({
    ok: z.literal(true),
    autorouting_bug_report: z.object({
      autorouting_bug_report_id: z.string().uuid(),
      title: z.string(),
      description: z.string().nullable(),
      created_at: z.string().datetime(),
    }),
  }),
})(async (req, ctx) => {
  const now = new Date().toISOString()

  return ctx.json({
    ok: true,
    autorouting_bug_report: {
      autorouting_bug_report_id: crypto.randomUUID(),
      title: req.jsonBody.title,
      description: req.jsonBody.description ?? null,
      created_at: now,
    },
  })
})
