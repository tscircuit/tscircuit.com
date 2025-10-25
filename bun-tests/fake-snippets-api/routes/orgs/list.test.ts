import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/orgs/list - should return user's organizations when authenticated", async () => {
  const { jane_axios } = await getTestServer()

  const listResponse = await jane_axios.get("/api/orgs/list")

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)
  expect(Array.isArray(responseBody.orgs)).toBe(true)
  const personalOrg = responseBody.orgs.find(
    (x: { is_personal_org: boolean }) => x.is_personal_org,
  )
  expect(personalOrg).toBeDefined()
  expect(personalOrg.name).toBe("jane")
  expect(personalOrg.user_permissions?.can_manage_org).toBe(true)
})
