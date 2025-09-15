import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/update - should update org name when owner", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "old-name",
  })
  const org = createResponse.data.org

  const updateResponse = await axios.post("/api/orgs/update", {
    org_id: org.org_id,
    name: "new-name",
  })

  expect(updateResponse.status).toBe(200)
  const responseBody = updateResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.name).toBe("new-name")
  expect(responseBody.org.user_permissions?.can_manage_org).toBe(true)
})

test("PATCH /api/orgs/update - should update org name using PATCH method", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "patch-test",
  })
  const org = createResponse.data.org

  const updateResponse = await axios.patch("/api/orgs/update", {
    org_id: org.org_id,
    name: "patch-updated",
  })

  expect(updateResponse.status).toBe(200)
  expect(updateResponse.data.org.name).toBe("patch-updated")
})

test("POST /api/orgs/update - should return current org when no changes provided", async () => {
  const { axios } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "no-change",
  })
  const org = createResponse.data.org

  const updateResponse = await axios.post("/api/orgs/update", {
    org_id: org.org_id,
  })

  expect(updateResponse.status).toBe(200)
  expect(updateResponse.data.org.name).toBe("no-change")
})

test("POST /api/orgs/update - should fail when user lacks management permissions", async () => {
  const { axios, seed } = await getTestServer()

  try {
    await axios.post("/api/orgs/update", {
      org_id: seed.organization.org_id,
      name: "unauthorized-change",
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

test("POST /api/orgs/update - should reject duplicate name", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/orgs/create", {
    name: "dup-a",
  })
  const org2Response = await axios.post("/api/orgs/create", {
    name: "dup-b",
  })

  try {
    const updateResponse = await axios.post("/api/orgs/update", {
      org_id: org2Response.data.org.org_id,
      name: "dup-a",
    })
    console.log(2, updateResponse.data)
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("org_already_exists")
    expect(error.data.error.message).toBe(
      "An organization with this name already exists",
    )
  }
})
