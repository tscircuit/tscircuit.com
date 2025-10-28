import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: z.object({
    creator_account_id: z.string().optional(),
    owner_github_username: z.string().optional(),
    is_writable: z.boolean().optional(),
    owner_org_id: z.string().optional(),
    name: z.string().optional(),
    limit: z.number().int().min(1).optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(
      packageSchema.extend({
        starred_at: z.string().nullable(),
        user_permissions: z
          .object({
            can_manage_packages: z.boolean(),
          })
          .optional(),
      }),
    ),
  }),
})(async (req, ctx) => {
  const {
    creator_account_id,
    owner_github_username,
    name,
    is_writable,
    owner_org_id,
    limit,
  } = req.commonParams

  const auth = "auth" in ctx && ctx.auth ? ctx.auth : null

  if (
    !auth &&
    !is_writable &&
    !creator_account_id &&
    !owner_github_username &&
    !owner_org_id
  ) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "You must provide some filtering parameters or be logged in",
    })
  }

  // Helper to check if user can manage a package
  const canManagePackage = (pkg: any) => {
    if (!auth) return false
    // Check if user is a member of the package's owner org
    const state = ctx.db.getState()
    return state.orgAccounts.some(
      (oa) =>
        oa.account_id === auth.account_id && oa.org_id === pkg.owner_org_id,
    )
  }

  let packages = ctx.db.packages

  // Apply filters
  if (creator_account_id) {
    packages = packages.filter(
      (p) => p.creator_account_id === creator_account_id,
    )
  }
  if (owner_github_username) {
    packages = packages.filter(
      (p) => p.owner_github_username === owner_github_username,
    )
  }
  if (name) {
    packages = packages.filter((p) => p.name === name)
  }
  if (owner_org_id) {
    packages = packages.filter((p) => p.owner_org_id === owner_org_id)
  }
  if (limit) {
    packages = packages.slice(0, limit)
  }
  if (is_writable && auth) {
    packages = packages.filter(canManagePackage)
  }

  // Get star timestamps for authenticated user
  const starTimestamps = new Map<string, string>()
  if (auth) {
    ctx.db.accountPackages
      .filter((ap) => ap.account_id === auth.account_id && ap.is_starred)
      .forEach((ap) => {
        starTimestamps.set(ap.package_id, ap.updated_at)
      })
  }

  return ctx.json({
    ok: true,
    packages: packages.map((p) => ({
      ...p,
      latest_package_release_id: p.latest_package_release_id || null,
      starred_at: starTimestamps.get(p.package_id) || null,
      ...(auth
        ? {
            user_permissions: {
              can_manage_packages: canManagePackage(p),
            },
          }
        : {}),
    })),
  })
})
