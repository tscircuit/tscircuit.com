import {
  packageSchema,
  userPermissionsSchema,
} from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
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
    packages: z.array(
      packageSchema.extend({
        starred_at: z.string().nullable(),
        user_permissions: userPermissionsSchema,
      }),
    ),
  }),
})(async (req, ctx) => {
  const { creator_account_id, owner_github_username, name, is_writable } =
    req.commonParams

  const auth = "auth" in ctx && ctx.auth ? ctx.auth : null

  if (!auth && !is_writable && !creator_account_id && !owner_github_username) {
    return ctx.error(400, {
      error_code: "invalid_request",
      message: "You must provide some filtering parameters or be logged in",
    })
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

  if (is_writable && auth) {
    packages = packages.filter((p) => p.owner_org_id === auth.personal_org_id)
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
    packages: packages
      .filter((p) => {
        if (!auth) return !p.is_private
        const permissions = ctx.db.getPackagePermissions(p.package_id, auth)
        if (p.is_private) {
          return permissions.can_read_package
        } else {
          return true
        }
      })
      .map((p) => {
        const permissions = auth
          ? ctx.db.getPackagePermissions(p.package_id, auth)
          : {
              can_read_package: false,
              can_manage_package: false,
              can_manage_org: false,
            }
        return {
          ...p,
          latest_package_release_id: p.latest_package_release_id || null,
          starred_at: starTimestamps.get(p.package_id) || null,
          user_permissions: {
            can_read_package: permissions.can_read_package,
            can_manage_package: permissions.can_manage_package,
            can_manage_org: permissions.can_manage_org,
          },
        }
      }),
  })
})
