import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    owner_name: z.string().optional(),
    unscoped_name: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  const { owner_name, unscoped_name } = req.commonParams

  const packages = ctx.db
    .getPackagesByAuthor(owner_name)
    .filter((s) => !unscoped_name || s.unscoped_name === unscoped_name)

  const snippets = packages.map((pkg) => {
    const packageRelease = ctx.db.getPackageReleaseById(pkg.latest_package_release_id)
    const packageFiles = ctx.db.getPackageFilesByReleaseId(packageRelease.package_release_id)
    const codeFile = packageFiles.find((file) => file.file_path === "index.ts" || file.file_path === "index.tsx")
    const starCount = ctx.db.getStarCount(pkg.package_id)
    
    return {
      snippet_id: pkg.package_id,
      package_release_id: pkg.latest_package_release_id || "",
      unscoped_name: pkg.unscoped_name,
      name: pkg.name,
      owner_name: pkg.owner_github_username || "",
      description: pkg.description || "",
      snippet_type: pkg.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts: packageFiles.find((file) => file.file_path === "/dist/index.d.ts")?.content_text || "",
      compiled_js: packageFiles.find((file) => file.file_path === "/dist/index.js")?.content_text || "",
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
      star_count: starCount,
      is_starred: false,
      version: pkg.latest_version || "0.0.1",
    }
  })

  return ctx.json({
    ok: true,
    snippets,
  })
})
