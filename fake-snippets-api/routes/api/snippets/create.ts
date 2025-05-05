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
    is_private: z.boolean().optional(),
    is_public: z.boolean().optional(),
    is_unlisted: z.boolean().optional(),
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
    is_private,
    is_public,
    is_unlisted,
  } = req.jsonBody

  const timestamp = Date.now()
  const currentTime = new Date(timestamp).toISOString()

  if (!unscoped_name) {
    // Count snippets of this type for this user
    const userSnippets = ctx.db.packages.filter(
      (p) =>
        p.owner_github_username === ctx.auth.github_username &&
        p.is_snippet === true &&
        ((p.is_board && snippet_type === "board") ||
          (p.is_package && snippet_type === "package") ||
          (p.is_model && snippet_type === "model") ||
          (p.is_footprint && snippet_type === "footprint")),
    )
    unscoped_name = `untitled-${snippet_type}-${userSnippets.length + 1}`
  }

  const existingPackage = ctx.db.packages.find(
    (pkg) =>
      pkg.unscoped_name === unscoped_name &&
      pkg.owner_github_username === ctx.auth.github_username,
  )

  if (existingPackage) {
    return ctx.error(400, {
      error_code: "snippet_already_exists",
      message: "You have already forked this snippet in your account.",
    })
  }

  try {
    // Create the package directly (which will serve as our snippet)
    const newPackage = ctx.db.addPackage({
      creator_account_id: ctx.auth.account_id,
      owner_org_id: ctx.auth.personal_org_id,
      owner_github_username: ctx.auth.github_username,
      is_source_from_github: false,
      description: description,
      name: `${ctx.auth.github_username}/${unscoped_name}`,
      unscoped_name: unscoped_name,
      latest_version: "0.0.1",
      license: null,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      ai_description: null,
      is_snippet: true,
      is_board: snippet_type === "board",
      is_package: snippet_type === "package",
      is_model: snippet_type === "model",
      is_footprint: snippet_type === "footprint",
      snippet_type: snippet_type,
      is_private: is_private || false,
      is_public: is_public || true,
      is_unlisted: is_unlisted || false,
      latest_package_release_id: null,
      ai_usage_instructions: "placeholder ai usage instructions",
    })

    const newPackageRelease = ctx.db.addPackageRelease({
      package_id: newPackage.package_id,
      version: "0.0.1",
      is_latest: true,
      is_locked: false,
      created_at: currentTime,
      // Setting the transpiled as true on creation
      has_transpiled: true,
      transpilation_error: null,
    })

    ctx.db.updatePackage(newPackage.package_id, {
      latest_package_release_id: newPackageRelease.package_release_id,
    })

    // Add package files
    // Add index.tsx file with the code content
    ctx.db.addPackageFile({
      package_release_id: newPackageRelease.package_release_id,
      file_path: "index.tsx",
      content_text: code,
      created_at: currentTime,
    })

    // Add DTS file if provided
    if (dts) {
      ctx.db.addPackageFile({
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.d.ts",
        content_text: dts,
        created_at: currentTime,
      })
    }

    // Add compiled JS if provided
    if (compiled_js) {
      ctx.db.addPackageFile({
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.js",
        content_text: compiled_js,
        created_at: currentTime,
      })
    }

    // Add circuit JSON if provided
    if (circuit_json) {
      ctx.db.addPackageFile({
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/circuit.json",
        content_text: JSON.stringify(circuit_json),
        created_at: currentTime,
      })
    }

    // Create the snippet response object
    const snippetResponse = {
      snippet_id: newPackage.package_id,
      package_release_id: newPackageRelease.package_release_id,
      name: newPackage.name,
      unscoped_name: newPackage.unscoped_name,
      owner_name: ctx.auth.github_username,
      code,
      dts,
      compiled_js,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      snippet_type: snippet_type,
      circuit_json: circuit_json || [],
      description: description,
      is_starred: false,
      version: "0.0.1",
      is_private: is_private || false,
      is_public: is_public || true,
      is_unlisted: is_unlisted || false,
    }

    return ctx.json({
      ok: true,
      snippet: snippetResponse,
    })
  } catch (error) {
    return ctx.error(500, {
      error_code: "snippet_creation_failed",
      message: `Failed to create snippet: ${error}`,
    })
  }
})
