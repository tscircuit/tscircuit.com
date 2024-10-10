import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    account_balance: z.object({
      monthly_ai_budget_used_usd: z.number(),
    }),
  }),
})(async (req, ctx) => {
  // For this example, we'll return a mock balance
  // In a real implementation, you would fetch this from a database or external service
  const mockBalance = {
    monthly_ai_budget_used_usd: 2.5,
  }

  return ctx.json({
    account_balance: mockBalance,
  })
})
