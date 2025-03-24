import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import type { DbClient } from "fake-snippets-api/lib/db/db-client"

const getAccountByGithubUsername = (db: DbClient, username: string) => {
  return db.accounts.find((a) => a.github_username === username)
}

const checkIsStarred = (
  db: DbClient,
  githubUsername: string | undefined,
  packageId: string,
) => {
  if (!githubUsername) return false
  const account = getAccountByGithubUsername(db, githubUsername)
  return account ? db.hasStarred(account.account_id, packageId) : false
}

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

  const packages = ctx.db.packages.filter((pkg) => {
    if (!pkg.is_snippet) return false

    if (owner_name && pkg.owner_github_username !== owner_name) return false

    if (unscoped_name && pkg.unscoped_name !== unscoped_name) return false

    if (starred_by) {
      const account = getAccountByGithubUsername(ctx.db, starred_by)
      if (!account) return false
      if (!ctx.db.hasStarred(account.account_id, pkg.package_id)) return false
    }

    return true
  })

  const snippets = packages.map((pkg) => {
    const packageRelease = ctx.db.getPackageReleaseById(
      pkg.latest_package_release_id || "",
    )
    const packageFiles = ctx.db.getPackageFilesByReleaseId(
      packageRelease?.package_release_id || "",
    )
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx",
    )
    const starCount = ctx.db.getStarCount(pkg.package_id)
    const isStarred = checkIsStarred(
      ctx.db,
      starred_by || ctx.auth?.github_username,
      pkg.package_id,
    )

    return {
      snippet_id: pkg.package_id,
      package_release_id: pkg.latest_package_release_id || "",
      unscoped_name: pkg.unscoped_name,
      name: pkg.name,
      owner_name: pkg.owner_github_username || "",
      description: pkg.description || "",
      snippet_type: pkg.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts:
        packageFiles.find((file) => file.file_path === "/dist/index.d.ts")
          ?.content_text || "",
      compiled_js:
        packageFiles.find((file) => file.file_path === "/dist/index.js")
          ?.content_text || "",
      created_at: pkg.created_at,
      updated_at: pkg.updated_at,
      star_count: starCount,
      is_starred: isStarred,
      version: pkg.latest_version || "0.0.1",
      is_private: pkg.is_private || false,
      is_public: pkg.is_public || true,
      is_unlisted: pkg.is_unlisted || false,
    }
  })

  return ctx.json({
    ok: true,
    snippets,
  })
})
