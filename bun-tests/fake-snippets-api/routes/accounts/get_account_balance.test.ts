import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get account balance", async () => {
  const { axios } = await getTestServer()

  const response = await axios.get("/api/accounts/get_account_balance", {
    headers: {
      Authorization: "Bearer 1234",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.account_balance).toBeDefined()
  expect(typeof response.data.account_balance.monthly_ai_budget_used_usd).toBe(
    "number",
  )
})
