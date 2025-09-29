import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/update_member - should update member permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: true,
    can_manage_package: false,
  })

  const updateResponse = await jane_axios.post("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: false,
    can_manage_package: true,
  })

  expect(updateResponse.status).toBe(200)

  const membership = db.getOrganizationAccount({
    account_id: seed.account.account_id,
    org_id: seed.organization.org_id,
  })
  expect(membership?.can_read_package).toBe(false)
  expect(membership?.can_manage_package).toBe(true)
})

test("PATCH /api/orgs/update_member - should update partial permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: true,
    can_manage_package: false,
  })

  const updateResponse = await jane_axios.patch("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_manage_package: true,
  })

  expect(updateResponse.status).toBe(200)

  const membership = db.getOrganizationAccount({
    account_id: seed.account.account_id,
    org_id: seed.organization.org_id,
  })
  expect(membership?.can_read_package).toBe(true)
  expect(membership?.can_manage_package).toBe(true)
})

test("POST /api/orgs/update_member - should fail for non-owner", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  try {
    await axios.post("/api/orgs/update_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
      user_permissions: {
        can_manage_package: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})

test("POST /api/orgs/update_member - should fail for non-existent member", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.post("/api/orgs/update_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
      user_permissions: {
        can_manage_package: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("member_not_found")
  }
})
