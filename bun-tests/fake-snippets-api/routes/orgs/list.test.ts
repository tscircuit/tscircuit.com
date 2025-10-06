import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/orgs/list - should return user's organizations when authenticated", async () => {
  const { jane_axios } = await getTestServer()

  const listResponse = await jane_axios.get("/api/orgs/list")

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)
  expect(Array.isArray(responseBody.orgs)).toBe(true)
  const personalOrg = responseBody.orgs[0]
  expect(personalOrg).toBeDefined()
  expect(personalOrg.name).toBe("jane")
  expect(personalOrg.user_permissions?.can_manage_org).toBe(true)
})

test("GET /api/orgs/list - unauthenticated users can view public organizations by github_handle", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  const listResponse = await unauthenticatedAxios.get("/api/orgs/list", {
    params: { github_handle: "jane" },
  })

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)
  expect(Array.isArray(responseBody.orgs)).toBe(true)
  expect(responseBody.orgs.length).toBeGreaterThan(0)
  const personalOrg = responseBody.orgs.find((org: any) => org.name === "jane")
  expect(personalOrg).toBeDefined()
  // user_permissions is not included when user cannot manage org
  expect(personalOrg.user_permissions).toBeUndefined()
})
