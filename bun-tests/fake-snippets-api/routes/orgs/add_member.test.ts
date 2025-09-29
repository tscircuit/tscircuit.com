import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/add_member - should add a user to an org with default permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  const addResponse = await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  expect(addResponse.status).toBe(200)
  expect(addResponse.data).toEqual({})

  const membership = db.getOrganizationAccount({
    account_id: seed.account.account_id,
    org_id: seed.organization.org_id,
  })
  expect(membership).toBeDefined()
  expect(membership?.can_read_package).toBe(true)
  expect(membership?.can_manage_package).toBe(false)
})

test("POST /api/orgs/add_member - should add a user with custom permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  const addResponse = await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: false,
    can_manage_package: true,
  })

  expect(addResponse.status).toBe(200)

  const membership = db.getOrganizationAccount({
    account_id: seed.account.account_id,
    org_id: seed.organization.org_id,
  })
  expect(membership).toBeDefined()
  expect(membership?.can_read_package).toBe(false)
  expect(membership?.can_manage_package).toBe(true)
})
