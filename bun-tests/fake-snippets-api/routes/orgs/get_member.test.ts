import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/orgs/get_member - should return member by org_id and account_id", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const getResponse = await jane_axios.get("/api/orgs/get_member", {
    params: {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.org_member).toBeDefined()
  expect(responseBody.org_member.account_id).toBe(seed.account.account_id)
  expect(responseBody.org_member.org_id).toBe(seed.organization.org_id)
  expect(responseBody.org_member.created_at).toBeDefined()
  expect(
    responseBody.org_member.org_member_permissions.can_manage_org,
  ).toBeDefined()
})

test("GET /api/orgs/get_member - should return member by org_name and account_id", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const getResponse = await jane_axios.get("/api/orgs/get_member", {
    params: {
      org_name: seed.organization.org_name,
      account_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.org_member).toBeDefined()
  expect(responseBody.org_member.account_id).toBe(seed.account.account_id)
  expect(responseBody.org_member.org_id).toBe(seed.organization.org_id)
  expect(responseBody.org_member.created_at).toBeDefined()
})

test("GET /api/orgs/get_member - should return 404 if org not found", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.get("/api/orgs/get_member", {
      params: {
        org_id: "non_existent_org_id",
        account_id: seed.account.account_id,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
    expect(error.data.error.message).toBe("Organization not found")
  }
})

test("GET /api/orgs/get_member - should return 404 if member not found in org", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.get("/api/orgs/get_member", {
      params: {
        org_id: seed.organization.org_id,
        account_id: "non_existent_account_id",
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("member_not_found")
    expect(error.data.error.message).toBe("Member not found in organization")
  }
})

test("GET /api/orgs/get_member - should return member with all required fields", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const getResponse = await jane_axios.get("/api/orgs/get_member", {
    params: {
      org_id: seed.organization.org_id,
      account_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const { org_member } = getResponse.data
  expect(org_member.account_id).toBe(seed.account.account_id)
  expect(org_member.org_id).toBe(seed.organization.org_id)
  expect(org_member.created_at).toBeDefined()
  expect(typeof org_member.created_at).toBe("string")
})
