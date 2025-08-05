import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
})(async (req, ctx) => {
  const account = ctx.db.getAccount(ctx.auth.account_id)
  
  if (!account) {
    return new Response("Account not found", { status: 401 })
  }

  // Get return_to_page from query params
  const url = new URL(req.url)
  const returnToPage = url.searchParams.get("return_to_page") || "/"

  // Check if user already has an active GitHub installation
  const existingInstallation = ctx.db.githubInstallations.find(
    (installation) => installation.account_id === ctx.auth.account_id && installation.is_active
  )

  if (existingInstallation) {
    // If installation already exists, redirect back
    return new Response("", {
      status: 302,
      headers: {
        Location: returnToPage,
      },
    })
  }

  // Create a new GitHub installation (simulating the user completing the GitHub App installation)
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

  // Return HTML page that shows installation success and redirects back
  return new Response(
    `
    <html>
      <head>
        <title>GitHub Installation Complete</title>
        <meta http-equiv="refresh" content="3;url=${returnToPage}">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
        <h1>✅ GitHub Installation Complete!</h1>
        <p>Your GitHub account has been successfully connected to tscircuit.</p>
        <p>You can now access your repositories in the package settings.</p>
        <p>Redirecting you back in 3 seconds...</p>
        <a href="${returnToPage}" style="color: #0066cc; text-decoration: none; font-weight: bold;">Click here if you're not redirected automatically</a>
      </body>
    </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  )
})
