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
    is_private: z.boolean().optional(),
    is_unlisted: z.boolean().optional(),
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
    is_private,
    is_unlisted,
  } = req.jsonBody

  const packageIndex = ctx.db.packages.findIndex(
    (s) => s.package_id === snippet_id,
  )

  if (packageIndex === -1) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  const _package = ctx.db.packages[packageIndex]
  const packageRelease = ctx.db.packageReleases.find(
    (r) => r.package_release_id === _package.latest_package_release_id,
  )
  const packageFiles = ctx.db.packageFiles.filter(
    (f) => f.package_release_id === packageRelease?.package_release_id,
  )
  const codeFile = packageFiles.find(
    (f) => f.file_path === "index.tsx" || f.file_path === "index.ts",
  )
  const dtsFile = packageFiles.find((f) => f.file_path === "/dist/index.d.ts")
  const compiledJsFile = packageFiles.find(
    (f) => f.file_path === "/dist/index.js",
  )
  const manualEditsJsonFile = packageFiles.find(
    (f) => f.file_path === "manual-edits.json",
  )
  const circuitJsonFile = packageFiles.find(
    (f) => f.file_path === "/dist/circuit.json",
  )

  if (_package.owner_github_username !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to update this snippet",
    })
  }

  const updatedSnippet = ctx.db.updateSnippet(snippet_id, {
    code: code ?? codeFile?.content_text ?? "",
    description: description ?? _package.description ?? "",
    unscoped_name: unscoped_name ?? _package.unscoped_name,
    name: unscoped_name
      ? `${ctx.auth.github_username}/${unscoped_name}`
      : _package.name,
    dts: dts ?? dtsFile?.content_text ?? "",
    compiled_js: compiled_js ?? compiledJsFile?.content_text ?? "",
    manual_edits_json_content:
      manual_edits_json_content !== undefined
        ? manual_edits_json_content
        : (manualEditsJsonFile?.content_text ?? ""),
    circuit_json:
      circuit_json ??
      (circuitJsonFile?.content_text
        ? JSON.parse(circuitJsonFile.content_text)
        : []),
    snippet_type: snippet_type ?? _package.snippet_type,
    is_private: is_private ?? _package.is_private ?? false,
    is_unlisted: is_unlisted ?? _package.is_unlisted ?? false,
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
