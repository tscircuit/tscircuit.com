import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("Organization permissions - owner should have all permissions", async () => {
  const { jane_axios, seed } = await getTestServer()

  const getResponse = await jane_axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  expect(getResponse.status).toBe(200)
  const org = getResponse.data.org
  expect(org.user_permissions?.can_manage_org).toBe(true)
  expect(org.user_permissions?.can_read_package).toBe(true)
  expect(org.user_permissions?.can_manage_package).toBe(true)
})

test("Organization permissions - member should have explicit permissions", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Add user as member with default permissions
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Check member permissions
  const memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  expect(memberResponse.status).toBe(200)
  const org = memberResponse.data.org
  expect(org.user_permissions?.can_manage_org).toBe(false)
  expect(org.user_permissions?.can_read_package).toBe(true)
  expect(org.user_permissions?.can_manage_package).toBe(false)
})

test("Organization permissions - member with custom permissions", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Add user as member with custom permissions
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: false,
    can_manage_package: true,
  })

  // Check member permissions
  const memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  expect(memberResponse.status).toBe(200)
  const org = memberResponse.data.org
  expect(org.user_permissions?.can_manage_org).toBe(false)
  expect(org.user_permissions?.can_read_package).toBe(false)
  expect(org.user_permissions?.can_manage_package).toBe(true)
})

test("Organization permissions - non-member should have no permissions", async () => {
  const { axios, seed } = await getTestServer()

  const nonMemberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  expect(nonMemberResponse.status).toBe(200)
  const org = nonMemberResponse.data.org
  expect(org.user_permissions?.can_manage_org).toBe(false)
  expect(org.user_permissions?.can_read_package).toBe(false)
  expect(org.user_permissions?.can_manage_package).toBe(false)
})

test("Organization permissions - member removal should revoke permissions", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Add user as member
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Verify member has read permissions
  let memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })
  expect(memberResponse.data.org.user_permissions?.can_read_package).toBe(true)

  // Remove member
  await jane_axios.post("/api/orgs/remove_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Verify permissions are revoked
  memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })
  expect(memberResponse.data.org.user_permissions?.can_read_package).toBe(false)
})

test("Organization permissions - updating member permissions", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Add user as member with default permissions
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Verify initial permissions
  let memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })
  expect(memberResponse.data.org.user_permissions?.can_read_package).toBe(true)
  expect(memberResponse.data.org.user_permissions?.can_manage_package).toBe(
    false,
  )

  // Update permissions
  await jane_axios.post("/api/orgs/update_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
    can_read_package: false,
    can_manage_package: true,
  })

  // Verify updated permissions
  memberResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })
  expect(memberResponse.data.org.user_permissions?.can_read_package).toBe(false)
  expect(memberResponse.data.org.user_permissions?.can_manage_package).toBe(
    true,
  )
})

test("Organization management - only owners can add members", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Owner can add members
  const addResponse = await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(addResponse.status).toBe(200)

  // Non-owner cannot add members
  try {
    await axios.post("/api/orgs/add_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account2.account_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})

test("Organization management - only owners can remove members", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Add member first
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Owner can remove members
  const removeResponse = await jane_axios.post("/api/orgs/remove_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })
  expect(removeResponse.status).toBe(200)

  // Re-add for next test
  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  // Non-owner cannot remove members
  try {
    await axios.post("/api/orgs/remove_member", {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})

test("Organization management - only owners can list members", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  // Owner can list members
  const listResponse = await jane_axios.get("/api/orgs/list_members", {
    params: { org_id: seed.organization.org_id },
  })
  expect(listResponse.status).toBe(200)
  expect(Array.isArray(listResponse.data.members)).toBe(true)

  // Non-owner cannot list members
  try {
    await axios.get("/api/orgs/list_members", {
      params: { org_id: seed.organization.org_id },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})
