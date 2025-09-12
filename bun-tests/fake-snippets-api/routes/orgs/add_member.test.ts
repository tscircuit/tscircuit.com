import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/add_member - should add a user to an org when owner authorized", async () => {
  const { axios, seed } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "team-rocket",
  })
  const org = createResponse.data.org

  const addMemberResponse = await axios.post("/api/orgs/add_member", {
    org_id: org.org_id,
    account_id: seed.account2.account_id,
  })

  expect(addMemberResponse.status).toBe(200)
  expect(addMemberResponse.data).toEqual({})
})

test("POST /api/orgs/add_member - should fail for non-existent org", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/orgs/add_member", {
      org_id: "non-existent-org-id",
      account_id: "account-5678",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
    expect(error.data.error.message).toBe("Organization not found")
  }
})

test("POST /api/orgs/add_member - should fail for non-existent account", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "test-org",
  })
  const org = createResponse.data.org

  try {
    await axios.post("/api/orgs/add_member", {
      org_id: org.org_id,
      account_id: "non-existent-account-id",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("account_not_found")
    expect(error.data.error.message).toBe("Account not found")
  }
})

test("POST /api/orgs/add_member - 69 should fail when user lacks management permissions", async () => {
  const { axios, seed } = await getTestServer()

  try {
    await axios.post("/api/orgs/add_member", {
      org_id: seed.organization.org_id,
      account_id: "account-5678",
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
