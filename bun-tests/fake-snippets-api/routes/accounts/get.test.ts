import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/accounts/get - should return full account with email when authenticated", async () => {
  const { axios } = await getTestServer()

  // The test server should automatically create a test account and set up authentication
  const response = await axios.get("/api/accounts/get")

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
  expect(response.data.account.email).toBeDefined()
})
test("GET /api/accounts/get - should return public account when unauthenticated", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  // The test server should automatically create a test account and set up authentication
  const response = await unauthenticatedAxios.post("/api/accounts/get", {
    github_username: "testuser",
  })

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
  expect(response.data.account.email).toBeUndefined()
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

test("POST /api/accounts/get - should return full account when requesting own account", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/accounts/get", {})

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
  expect(response.data.account.email).toBeDefined()
})

test("POST /api/accounts/get - should return public account when requesting other user", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/accounts/get", {
    github_username: "jane",
  })

  expect(response.status).toBe(200)
  expect(response.data.account).toBeDefined()
  expect(response.data.account.account_id).toBeDefined()
  expect(response.data.account.github_username).toBe("jane")
  expect(response.data.account.email).toBeUndefined()
  expect(response.data.account.shippingInfo).toBeUndefined()
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

test("POST /api/accounts/get - should be case insensitive", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/accounts/get", {
    github_username: "TestUser",
  })

  expect(response.status).toBe(200)
  expect(response.data.account.github_username).toBe("testuser")
})

test("POST /api/accounts/get - should return account by account_id", async () => {
  const { axios } = await getTestServer()

  const { data: selfData } = await axios.get("/api/accounts/get")
  const response = await axios.post("/api/accounts/get", {
    account_id: selfData.account.account_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.account.account_id).toBe(selfData.account.account_id)
})
