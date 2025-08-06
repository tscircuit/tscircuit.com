import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
    message: z.string(),
    repos_refreshed: z.number().optional(),
  }),
})(async (req, ctx) => {
  const account = ctx.db.getAccount(ctx.auth.account_id)

  if (!account) {
    return ctx.error(401, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  // Check GitHub installation
  const githubInstallation = ctx.db.githubInstallations.find(
    (installation) =>
      installation.account_id === ctx.auth.account_id && installation.is_active,
  )

  if (!githubInstallation) {
    return ctx.error(400, {
      error_code: "github_not_connected",
      message: "GitHub account not connected",
    })
  }

  // In a real implementation, this would refresh repos from GitHub API
  // For fake API, simulate refreshing by updating the installation timestamp
  githubInstallation.updated_at = new Date().toISOString()

  return ctx.json({
    success: true,
    message: "GitHub repositories refreshed successfully",
    repos_refreshed: 3, // Mock number
  })
})
