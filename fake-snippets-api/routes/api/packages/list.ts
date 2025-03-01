import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    creator_account_id: z.string().optional(),
    owner_github_username: z.string().optional(),
    is_writable: z.boolean().optional(),
    name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(packageSchema),
  }),
})(async (req, ctx) => {
  const { creator_account_id, owner_github_username, name, is_writable } =
    req.commonParams

  // Check if user is authenticated
  const auth = ctx.auth || null

  // Require filtering parameters or authentication
  if (!auth && !is_writable && !creator_account_id && !owner_github_username) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "You must provide some filtering parameters or be logged in",
    })
  }

  // Start with packages that are explicitly marked as packages (not snippets)
  let packages = ctx.db.packages.filter(
    (p) =>
      // Only include real packages, not snippets
      p.is_snippet !== true &&
      // Make sure it has required fields
      p.package_id &&
      p.name,
  )

  // Filter by owner_github_username if provided
  if (owner_github_username) {
    packages = packages.filter(
      (p) => p.owner_github_username === owner_github_username,
    )
  }

  // Filter by creator_account_id if provided
  if (creator_account_id) {
    packages = packages.filter(
      (p) => p.creator_account_id === creator_account_id,
    )
  }

  // Filter by name if provided
  if (name) {
    packages = packages.filter(
      (p) => p.name === name || p.unscoped_name === name,
    )
  }

  // Filter by is_writable if provided (requires auth)
  if (is_writable === true && auth) {
    packages = packages.filter((p) => p.owner_org_id === auth.personal_org_id)
  }

  // Map packages to public format
  const mappedPackages = packages.map((pkg) => {
    // Find the latest package release
    const latestRelease = ctx.db.packageReleases.find(
      (pr) => pr.package_id === pkg.package_id && pr.is_latest,
    )

    // Return enhanced package
    return publicMapPackage({
      ...pkg,
      latest_version: latestRelease?.version || pkg.latest_version,
      latest_license: latestRelease?.license || pkg.license,
      latest_package_release_id:
        latestRelease?.package_release_id || pkg.latest_package_release_id,
      star_count: pkg.star_count || 0,
    })
  })

  return ctx.json({
    ok: true,
    packages: mappedPackages,
  })
})
