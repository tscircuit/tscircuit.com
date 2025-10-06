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
})

test("GET /orgs/list_members - unauthenticated users can view members of public organizations", async () => {
  const { unauthenticatedAxios, seed } = await getTestServer()

  const {
    data: { members },
  } = await unauthenticatedAxios.get(
    `/api/orgs/list_members?org_id=${seed.organization.org_id}`,
  )

  expect(Array.isArray(members)).toBe(true)
  expect(members.length).toBeGreaterThan(0)
})

test("GET /orgs/list_members - unauthenticated users cannot view members of personal organizations", async () => {
  const { unauthenticatedAxios } = await getTestServer()

  try {
    await unauthenticatedAxios.get(
      `/api/orgs/list_members?name=testuser`,
    )
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})
