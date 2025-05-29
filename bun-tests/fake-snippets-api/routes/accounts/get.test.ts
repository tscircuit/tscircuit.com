import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/accounts/get - should return account when authenticated", async () => {
  const { axios } = await getTestServer()

  // The test server should automatically create a test account and set up authentication
  const response = await axios.get("/api/accounts/get")

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
})

test("GET /api/accounts/get - should return 404 if account not found", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  try {
    await unauthenticatedAxios.get("/api/accounts/get")
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("account_not_found")
    expect(error.data.error.message).toBe("Account not found")
  }
})

test("POST /api/accounts/get - should return account when authenticated", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/accounts/get", {
    github_username: "testuser",
  })

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
})

test("POST /api/accounts/get - should return 404 if account not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/accounts/get", {
      github_username: "nonexistentuser",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("account_not_found")
    expect(error.data.error.message).toBe("Account not found")
  }
})