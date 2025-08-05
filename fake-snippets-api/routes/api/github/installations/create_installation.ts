import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonResponse: z.object({
    github_installation_id: z.string(),
    success: z.boolean(),
  }),
})(async (_req, ctx) => {
  const account = ctx.db.getAccount(ctx.auth.account_id)
  
  if (!account) {
    return ctx.error(401, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  }

  // Check if user has GitHub account connected
  if (!account.github_username) {
    return ctx.error(400, {
      error_code: "github_not_connected",
      message: "GitHub account not connected. Please connect your GitHub account first.",
    })
  }

  // Check if user already has an active GitHub installation
  const existingInstallation = ctx.db.githubInstallations.find(
    (installation) => installation.account_id === ctx.auth.account_id && installation.is_active
  )

  if (existingInstallation) {
    return ctx.json({
      github_installation_id: existingInstallation.github_installation_id,
      success: true,
    })
  }

  // Create a new GitHub installation
  const githubInstallationId = uuidv4()
  const mockInstallationId = `${Date.now()}` // Mock GitHub App installation ID
  
  const newInstallation = {
    github_installation_id: githubInstallationId,
    account_id: ctx.auth.account_id,
    installation_id: mockInstallationId,
    github_username: account.github_username,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    access_token: `ghs_mock_token_${Date.now()}`, // Mock access token
    access_token_expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  }

  ctx.db.githubInstallations.push(newInstallation)

  return ctx.json({
    github_installation_id: githubInstallationId,
    success: true,
  })
})