import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/orgs/get - should return org by org_id", async () => {
  const { axios, jane_axios, seed } = await getTestServer()

  const getResponse = await jane_axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  const getNotOwnerResponse = await axios.get("/api/orgs/get", {
    params: { org_id: seed.organization.org_id },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  const responseBody2 = getNotOwnerResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.org_id).toBe(seed.organization.org_id)
  expect(responseBody.org.name).toBe(seed.organization.org_name)
  expect(responseBody.org.github_handle).toBe(seed.organization.github_handle)
  expect(responseBody.org.user_permissions?.can_manage_org).toBe(true)
  expect(responseBody2.org.user_permissions?.can_manage_org).not.toBe(true)
})

test("GET /api/orgs/get - should return org by github_handle", async () => {
  const { axios } = await getTestServer()

  const getResponse = await axios.get("/api/orgs/get", {
    params: { github_handle: "jane" },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.name).toBe("jane")
  expect(responseBody.org.user_permissions?.can_manage_org).not.toBe(true)
})

test("GET /api/orgs/get - should return 404 if org not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/orgs/get", {
      params: { org_id: "non_existent_org_id" },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
    expect(error.data.error.message).toBe("Organization not found")
  }
})
