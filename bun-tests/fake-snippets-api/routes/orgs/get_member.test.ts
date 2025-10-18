import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/orgs/get_member - should return member by org_id and member_id", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const getResponse = await jane_axios.get("/api/orgs/get_member", {
    params: {
      org_id: seed.organization.org_id,
      member_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.member).toBeDefined()
  expect(responseBody.member.account_id).toBe(seed.account.account_id)
  expect(responseBody.member.org_id).toBe(seed.organization.org_id)
  expect(responseBody.member.created_at).toBeDefined()
  expect(responseBody.member.can_manage_org).toBeDefined()
})

test("GET /api/orgs/get_member - should return member by org_name and member_id", async () => {
  const { jane_axios, seed } = await getTestServer()

  await jane_axios.post("/api/orgs/add_member", {
    org_id: seed.organization.org_id,
    account_id: seed.account.account_id,
  })

  const getResponse = await jane_axios.get("/api/orgs/get_member", {
    params: {
      org_name: seed.organization.org_name,
      member_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.member).toBeDefined()
  expect(responseBody.member.account_id).toBe(seed.account.account_id)
  expect(responseBody.member.org_id).toBe(seed.organization.org_id)
  expect(responseBody.member.created_at).toBeDefined()
})

test("GET /api/orgs/get_member - should return 404 if org not found", async () => {
  const { jane_axios, seed } = await getTestServer()

  try {
    await jane_axios.get("/api/orgs/get_member", {
      params: {
        org_id: "non_existent_org_id",
        member_id: seed.account.account_id,
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
        member_id: "non_existent_member_id",
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
      member_id: seed.account.account_id,
    },
  })

  expect(getResponse.status).toBe(200)
  const { member } = getResponse.data
  expect(member.account_id).toBe(seed.account.account_id)
  expect(member.org_id).toBe(seed.organization.org_id)
  expect(member.created_at).toBeDefined()
  expect(typeof member.created_at).toBe("string")
})
