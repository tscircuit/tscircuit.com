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

test("POST /api/orgs/update - should update github_handle when owner", async () => {
  const { axios, db } = await getTestServer()

  const createResponse = await axios.post("/api/orgs/create", {
    name: "handle-owner",
  })
  const org = createResponse.data.org

  const updateResponse = await axios.post("/api/orgs/update", {
    org_id: org.org_id,
    github_handle: "handle-owner",
  })

  expect(updateResponse.status).toBe(200)

  const state = db.getState()
  const updatedOrg = state.organizations.find(
    (o: any) => o.org_id === org.org_id,
  )
  expect(updatedOrg?.github_handle).toBe("handle-owner")
})

test("POST /api/orgs/update - 69 should reject duplicate github_handle", async () => {
  const { axios } = await getTestServer()

  const orgAResponse = await axios.post("/api/orgs/create", {
    name: "dup-handle-a",
  })
  const orgA = orgAResponse.data.org

  await axios.post("/api/orgs/update", {
    org_id: orgA.org_id,
    github_handle: "duplicate-handle",
  })

  const orgBResponse = await axios.post("/api/orgs/create", {
    name: "dup-handle-b",
  })
  const orgB = orgBResponse.data.org

  try {
    await axios.post("/api/orgs/update", {
      org_id: orgB.org_id,
      github_handle: "duplicate-handle",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("org_github_handle_already_exists")
  }
})
