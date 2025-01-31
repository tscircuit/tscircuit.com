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
    name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(packageSchema),
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

  return ctx.json({
    ok: true,
    packages,
  })
})
