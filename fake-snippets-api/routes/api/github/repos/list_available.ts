import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    repos: z.array(
      z.object({
        unscoped_name: z.string(),
        full_name: z.string(),
        private: z.boolean(),
        owner: z.object({
          login: z.string(),
        }),
        description: z.string().nullable(),
        default_branch: z.string(),
      }),
    ),
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

  // Check if user has a GitHub installation
  const githubInstallation = ctx.db.githubInstallations.find(
    (installation) => installation.account_id === ctx.auth.account_id && installation.is_active
  )

  if (!githubInstallation) {
    // Return empty array if no GitHub installation found
    return ctx.json({
      repos: [],
    })
  }

  // Mock repositories for demonstration
  // In a real implementation, this would fetch from GitHub API using the installation access token
  const mockRepos = [
    {
      unscoped_name: "my-electronics-project",
      full_name: `${account.github_username}/my-electronics-project`,
      owner: {
        login: account.github_username,
      },
      description: "Arduino-based sensor monitoring system",
      private: false,
      default_branch: "main",
    },
    {
      unscoped_name: "pcb-designs",
      full_name: `${account.github_username}/pcb-designs`,
      owner: {
        login: account.github_username,
      },
      description: "Collection of PCB designs for various projects",
      private: true,
      default_branch: "main",
    },
    {
      unscoped_name: "tscircuit-examples",
      full_name: `${account.github_username}/tscircuit-examples`,
      owner: {
        login: account.github_username,
      },
      description: "Examples and tutorials for tscircuit",
      private: false,
      default_branch: "main",
    },
  ]

  return ctx.json({
    repos: mockRepos,
  })
})