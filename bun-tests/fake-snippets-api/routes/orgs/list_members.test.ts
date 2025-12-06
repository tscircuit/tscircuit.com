import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { Account } from "fake-snippets-api/lib/db/schema"

test("GET /orgs/list_members returns members for an org when owner", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const {
    data: { org_members },
  } = await jane_axios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
  )
  expect(Array.isArray(org_members)).toBe(true)
  const membership = org_members.find(
    (m: any) => m.account_id === seed.account.account_id,
  )
  expect(membership).toBeDefined()
  expect(membership.joined_at).toBeDefined()
  expect(membership.org_member_permissions).toBeDefined()
})

test("GET /orgs/list_members email visibility", async () => {
  const { jane_axios, unauthenticatedAxios, seed, db } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const {
    data: { org_members: membersAsMember },
  } = await jane_axios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
  )
  const testUserAsMember = membersAsMember.find(
    (m: Account) => m.account_id === seed.account.account_id,
  )
  expect(testUserAsMember.email).toBe(seed.account.email)

  const {
    data: { org_members: membersUnauth },
  } = await unauthenticatedAxios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
  )
  const testUserUnauth = membersUnauth.find(
    (m: Account) => m.account_id === seed.account.account_id,
  )
  expect(testUserUnauth.email).toBeUndefined()

  const outsider = db.addAccount({
    github_username: "outsider",
    tscircuit_handle: "outsider",
  })

  const {
    data: { org_members: membersOutsider },
  } = await unauthenticatedAxios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
    {
      headers: {
        Authorization: `Bearer ${outsider.account_id}`,
      },
    },
  )
  const testUserOutsider = membersOutsider.find(
    (m: Account) => m.account_id === seed.account.account_id,
  )
  expect(testUserOutsider.email).toBeUndefined()
})
