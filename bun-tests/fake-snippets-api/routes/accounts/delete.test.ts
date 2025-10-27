import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("DELETE /api/accounts/delete - should delete authenticated account", async () => {
  const { axios } = await getTestServer()

  const response = await axios.delete("/api/accounts/delete")

  expect(response.status).toBe(200)
  expect(response.data.success).toBe(true)
})

test("DELETE /api/accounts/delete - should return 404 if account not found", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  try {
    await unauthenticatedAxios.delete("/api/accounts/delete")
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("account_not_found")
    expect(error.data.error.message).toBe("Account not found")
  }
})
