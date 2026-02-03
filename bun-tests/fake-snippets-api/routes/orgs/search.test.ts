import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/search - should search organizations by tscircuit_handle", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  const searchResponse = await jane_axios.post("/api/orgs/search", {
    query: seed.organization.tscircuit_handle?.slice(0, 6),
  })
  const searchResponse2 = await axios.post("/api/orgs/search", {
    query: seed.organization.tscircuit_handle?.slice(0, 6),
  })

  expect(searchResponse.status).toBe(200)
  expect(searchResponse.data.ok).toBe(true)
  expect(Array.isArray(searchResponse.data.orgs)).toBe(true)
  expect(searchResponse.data.orgs.length).toBeGreaterThan(0)
  expect(
    searchResponse.data.orgs.some(
      (org: any) => org.tscircuit_handle === seed.organization.tscircuit_handle,
    ),
  ).toBe(true)
  expect(searchResponse.data.orgs[0]?.user_permissions?.can_manage_org).toBe(
    true,
  )
  expect(
    searchResponse2.data.orgs[0]?.user_permissions?.can_manage_org,
  ).not.toBe(true)
})
