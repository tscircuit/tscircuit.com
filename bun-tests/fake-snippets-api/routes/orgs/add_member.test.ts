import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/add_member - should add a user to an org (owner authorized)", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  const originalMember = db.getAccount(seed.account.account_id)

  const addResponse = await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  expect(addResponse.status).toBe(200)
  expect(addResponse.data).toEqual({})

  expect(db.getAccount(seed.account.account_id)?.personal_org_id).toEqual(
    String(originalMember?.personal_org_id),
  )

  const membership = db.getOrganizationAccount({
    account_id: seed.account.account_id,
    org_id: seed.organization.org_id,
  })
  expect(membership).toBeDefined()
})
