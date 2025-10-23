import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/update_member - should update member permissions (owner authorized)", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const updateResponse = await jane_axios.post("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    org_member_permissions: {
      can_manage_org: true,
    },
  })

  expect(updateResponse.status).toBe(200)
  expect(updateResponse.data).toEqual({})

  const membership = db.getOrganizationAccount({
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(membership?.can_manage_org).toBe(true)
})

test("PUT /api/orgs/update_member - should update member permissions using PUT method", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const membership = db.getOrganizationAccount({
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(membership?.can_manage_org).toBe(false)

  const updateResponse = await jane_axios.put("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    org_member_permissions: {
      can_manage_org: true,
    },
  })

  expect(updateResponse.status).toBe(200)
  expect(updateResponse.data).toEqual({})

  const membership2 = db.getOrganizationAccount({
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(membership2?.can_manage_org).toBe(true)
})

test("POST /api/orgs/update_member - should revoke management permissions", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  await jane_axios.post("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    org_member_permissions: {
      can_manage_org: true,
    },
  })

  const updateResponse = await jane_axios.post("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    org_member_permissions: {
      can_manage_org: false,
    },
  })

  expect(updateResponse.status).toBe(200)

  const membership = db.getOrganizationAccount({
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(membership?.can_manage_org).toBe(false)
})

test("POST /api/orgs/update_member - should fail for non-owner (403)", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  try {
    await axios.post("/api/orgs/update_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
      org_member_permissions: {
        can_manage_org: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
    expect(error.data.error.message).toBe(
      "You do not have permission to manage this organization",
    )
  }
})

test("POST /api/orgs/update_member - should fail if org not found (404)", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.post("/api/orgs/update_member", {
      org_id: "non_existent_org_id",
      account_id: seed.account.account_id,
      org_member_permissions: {
        can_manage_org: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
    expect(error.data.error.message).toBe("Organization not found")
  }
})

test("POST /api/orgs/update_member - should fail if member not found (404)", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.post("/api/orgs/update_member", {
      org_id: seed.organization.org_id,
      account_id: "non_existent_account_id",
      org_member_permissions: {
        can_manage_org: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("member_not_found")
    expect(error.data.error.message).toBe(
      "Member not found in this organization",
    )
  }
})

test("POST /api/orgs/update_member - should fail when trying to update own permissions (400)", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.post("/api/orgs/update_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account2.account_id,
      org_member_permissions: {
        can_manage_org: false,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("cannot_update_self")
    expect(error.data.error.message).toBe(
      "You cannot update your own permissions",
    )
  }
})
