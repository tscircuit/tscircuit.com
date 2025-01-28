import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    unscoped_name: z.string().optional(),
    code: z.string().optional(),
    snippet_type: z.enum(["board", "package", "model", "footprint"]),
    description: z.string().optional(),
    compiled_js: z.string().optional(),
    circuit_json: z.array(z.record(z.any())).optional().nullable(),
    dts: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippet: snippetSchema.optional(),
  }),
})(async (req, ctx) => {
  let {
    unscoped_name,
    code = "",
    snippet_type,
    description = "",
    compiled_js,
    circuit_json,
    dts,
  } = req.jsonBody

  if (!unscoped_name) {
    unscoped_name = `untitled-${snippet_type}-${ctx.db.idCounter + 1}`
  }

  const existingSnippet = ctx.db.snippets.find(
    (snippet) =>
      snippet.unscoped_name === unscoped_name &&
      snippet.owner_name === ctx.auth.github_username,
  )

  if (existingSnippet) {
    return ctx.error(400, {
      error_code: "snippet_already_exists",
      message: "You have already forked this snippet in your account.",
    })
  }

  let newSnippet: Omit<
    z.input<typeof snippetSchema>,
    "snippet_id" | "package_release_id"
  > = {
    name: `${ctx.auth.github_username}/${unscoped_name}`,
    unscoped_name,
    owner_name: ctx.auth.github_username,
    code,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type,
    description,
    compiled_js,
    circuit_json,
    dts,
  }

  try {
    newSnippet = ctx.db.addSnippet(newSnippet)
  } catch (error) {
    return ctx.error(500, {
      error_code: "snippet_creation_failed",
      message: `Failed to create snippet: ${error}`,
    })
  }

  return ctx.json({
    ok: true,
    snippet: newSnippet as any,
  })
})
