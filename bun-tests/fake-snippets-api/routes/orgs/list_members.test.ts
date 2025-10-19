import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /orgs/list_members returns members for an org when owner", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const {
    data: { members },
  } = await jane_axios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
  )
  expect(Array.isArray(members)).toBe(true)
  const membership = members.find(
    (m: any) => m.account_id === seed.account.account_id,
  )
  expect(membership).toBeDefined()
  expect(membership.joined_at).toBeDefined()
  expect(membership.user_permissions).toBeDefined()
})
