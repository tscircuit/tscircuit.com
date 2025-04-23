import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema, type Account } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    owner_name: z.string().optional(),
    unscoped_name: z.string().optional(),
    starred_by: z.string().optional(),
  }),
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    snippets: z.array(snippetSchema),
  }),
})(async (req, ctx) => {
  const { owner_name, unscoped_name, starred_by } = req.commonParams
  let starredByAccount: Account | null = null
  // Get all packages that are snippets
  let packages = ctx.db.packages.filter((pkg) => pkg.is_snippet === true)

  // Filter by owner_name if provided
  if (owner_name) {
    packages = packages.filter(
      (pkg) =>
        pkg.owner_github_username?.toLowerCase() === owner_name.toLowerCase(),
    )
  }

  // Filter by unscoped_name if provided
  if (unscoped_name) {
    packages = packages.filter(
      (pkg) => pkg.unscoped_name.toLowerCase() === unscoped_name.toLowerCase(),
    )
  }

  // Filter by starred_by if provided
  if (starred_by) {
    starredByAccount =
      ctx.db.accounts.find(
        (acc) => acc.github_username.toLowerCase() === starred_by.toLowerCase(),
      ) || null

    if (starredByAccount) {
      const accountPackages = ctx.db.accountPackages.filter(
        (ap) => ap.account_id === starredByAccount?.account_id && ap.is_starred,
      )

      const starTimestamps = new Map(
        accountPackages.map((ap) => [ap.package_id, ap.updated_at]),
      )

      // Filter packages to only include starred ones
      packages = packages.filter((pkg) => starTimestamps.has(pkg.package_id))
    } else {
      packages = []
    }
  }

  // Convert packages to snippets
  const snippets = packages.map((pkg) => {
    const packageRelease = ctx.db.getPackageReleaseById(
      pkg.latest_package_release_id || "",
    )

    let starTimestamp
    if (starred_by && starredByAccount) {
      const accountPackage = ctx.db.accountPackages.find(
        (ap) =>
          ap.account_id === starredByAccount.account_id &&
          ap.package_id === pkg.package_id &&
          ap.is_starred,
      )
      starTimestamp = accountPackage?.updated_at
    }

    if (!packageRelease) {
      return {
        snippet_id: pkg.package_id,
        package_release_id: pkg.latest_package_release_id || "",
        unscoped_name: pkg.unscoped_name,
        name: pkg.name,
        owner_name: pkg.owner_github_username || "",
        description: pkg.description || "",
        snippet_type: pkg.snippet_type || "board",
        code: "",
        dts: "",
        compiled_js: "",
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        starred_at: starTimestamp, // Add star timestamp
        star_count: ctx.db.getStarCount(pkg.package_id),
        is_starred: ctx.auth
          ? ctx.db.hasStarred(ctx.auth.account_id, pkg.package_id)
          : false,
        version: pkg.latest_version || "0.0.1",
        is_private: pkg.is_private || false,
        is_public: pkg.is_public || true,
        is_unlisted: pkg.is_unlisted || false,
      }
    }

    const packageFiles = ctx.db.getPackageFilesByReleaseId(
      packageRelease.package_release_id,
    )
    const codeFile = packageFiles.find(
      (file: { file_path: string }) =>
        file.file_path === "index.ts" || file.file_path === "index.tsx",
    )

    const snippet = {
      snippet_id: pkg.package_id,
      package_release_id: pkg.latest_package_release_id || "",
      unscoped_name: pkg.unscoped_name,
      name: pkg.name,
      owner_name: pkg.owner_github_username || "",
      description: pkg.description || "",
      snippet_type: pkg.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts:
        packageFiles.find(
          (file: { file_path: string }) =>
            file.file_path === "/dist/index.d.ts",
        )?.content_text || "",
      compiled_js:
        packageFiles.find(
          (file: { file_path: string }) => file.file_path === "/dist/index.js",
        )?.content_text || "",
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
      star_timestamp: starTimestamp, // Add star timestamp
      star_count: ctx.db.getStarCount(pkg.package_id),
      is_starred: ctx.auth
        ? ctx.db.hasStarred(ctx.auth.account_id, pkg.package_id)
        : false,
      version: pkg.latest_version || "0.0.1",
      is_private: pkg.is_private || false,
      is_public: pkg.is_public || true,
      is_unlisted: pkg.is_unlisted || false,
    }

    return snippet
  })

  return ctx.json({
    ok: true,
    snippets,
  })
})
