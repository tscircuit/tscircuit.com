import { z } from "zod"
import { snippetSchema } from "../../../lib/db/schema"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    snippet_id: z.string(),
    code: z.string().optional(),
    description: z.string().optional(),
    unscoped_name: z.string().optional(),
    dts: z.string().optional(),
    compiled_js: z.string().optional().nullable(),
    circuit_json: z.array(z.record(z.any())).optional().nullable(),
    manual_edits_json_content: z.string().optional().nullable(),
    snippet_type: z.enum(["board", "package", "model", "footprint"]).optional(),
    datasheet_url: z.string().url().optional().nullable(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippet: snippetSchema,
  }),
})(async (req, ctx) => {
  const {
    snippet_id,
    code,
    description,
    unscoped_name,
    dts,
    compiled_js,
    circuit_json,
    snippet_type,
    manual_edits_json_content,
    datasheet_url,
  } = req.jsonBody

  const snippetIndex = ctx.db.snippets.findIndex(
    (s) => s.snippet_id === snippet_id,
  )

  if (snippetIndex === -1) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  const snippet = ctx.db.snippets[snippetIndex]

  if (snippet.owner_name !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to update this snippet",
    })
  }

  const updatedSnippet = ctx.db.updateSnippet(snippet_id, {
    code: code ?? snippet.code,
    description: description ?? snippet.description,
    unscoped_name: unscoped_name ?? snippet.unscoped_name,
    name: unscoped_name
      ? `${ctx.auth.github_username}/${unscoped_name}`
      : snippet.name,
    dts: dts ?? snippet.dts,
    compiled_js: compiled_js !== undefined ? compiled_js : snippet.compiled_js,
    manual_edits_json_content:
      manual_edits_json_content !== undefined
        ? manual_edits_json_content
        : snippet.manual_edits_json_content,
    circuit_json:
      circuit_json !== undefined ? circuit_json : snippet.circuit_json,
    snippet_type: snippet_type ?? snippet.snippet_type,
    datasheet_url: datasheet_url !== undefined ? datasheet_url : snippet.datasheet_url,
    updated_at: new Date().toISOString(),
  })

  if (!updatedSnippet) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update snippet",
    })
  }

  return ctx.json({
    ok: true,
    snippet: updatedSnippet,
  })
})
