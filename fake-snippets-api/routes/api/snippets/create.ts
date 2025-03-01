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
    // Count snippets of this type for this user
    const userSnippets = ctx.db.snippets.filter(
      (s) =>
        s.owner_name === ctx.auth.github_username &&
        s.snippet_type === snippet_type,
    )
    unscoped_name = `untitled-${snippet_type}-${userSnippets.length + 1}`
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

  try {
    // Create the snippet
    const newSnippet = {
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

    // Add the snippet to the database
    const createdSnippet = ctx.db.addSnippet(newSnippet)

    // Also create a package with the same ID
    const packageData = {
      package_id: createdSnippet.snippet_id,
      creator_account_id: ctx.auth.account_id,
      owner_org_id: ctx.auth.personal_org_id,
      owner_github_username: ctx.auth.github_username,
      is_source_from_github: false,
      description: description,
      name: `${ctx.auth.github_username}/${unscoped_name}`,
      unscoped_name: unscoped_name,
      latest_package_release_id: createdSnippet.package_release_id,
      latest_version: "0.0.1",
      license: null,
      star_count: 0,
      created_at: createdSnippet.created_at,
      updated_at: createdSnippet.updated_at,
      ai_description: null,
      is_snippet: true,
      is_board: snippet_type === "board",
      is_package: snippet_type === "package",
      is_model: snippet_type === "model",
      is_footprint: snippet_type === "footprint",
    }

    // Add the package to the database
    ctx.db.packages.push(packageData)

    // Ensure package release exists
    const packageRelease = ctx.db.packageReleases.find(
      (pr) => pr.package_release_id === createdSnippet.package_release_id,
    )

    if (!packageRelease) {
      // Create a package release if it doesn't exist
      ctx.db.addPackageRelease({
        package_id: createdSnippet.snippet_id,
        version: "0.0.1",
        is_latest: true,
        is_locked: false,
        created_at: createdSnippet.created_at,
      })
    }

    // Add package files based on snippet type
    if (
      snippet_type === "package" ||
      snippet_type === "board" ||
      snippet_type === "model" ||
      snippet_type === "footprint"
    ) {
      // Add index.tsx file with the code content
      ctx.db.addPackageFile({
        package_release_id: createdSnippet.package_release_id,
        file_path: "index.tsx",
        content_text: code,
        created_at: new Date().toISOString(),
      })

      // Add DTS file if provided
      if (dts) {
        ctx.db.addPackageFile({
          package_release_id: createdSnippet.package_release_id,
          file_path: "/dist/index.d.ts",
          content_text: dts,
          created_at: new Date().toISOString(),
        })
      }

      // Add compiled JS if provided
      if (compiled_js) {
        ctx.db.addPackageFile({
          package_release_id: createdSnippet.package_release_id,
          file_path: "/dist/index.js",
          content_text: compiled_js,
          created_at: new Date().toISOString(),
        })
      }

      // Add circuit JSON if provided
      if (circuit_json) {
        ctx.db.addPackageFile({
          package_release_id: createdSnippet.package_release_id,
          file_path: "/dist/circuit.json",
          content_text: JSON.stringify(circuit_json),
          created_at: new Date().toISOString(),
        })
      }
    }

    return ctx.json({
      ok: true,
      snippet: createdSnippet,
    })
  } catch (error) {
    return ctx.error(500, {
      error_code: "snippet_creation_failed",
      message: `Failed to create snippet: ${error}`,
    })
  }
})