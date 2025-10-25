import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/delete - should delete an organization", async () => {
  const { jane_axios, seed } = await getTestServer()

  const createResponse = await jane_axios.post("/api/orgs/create", {
    name: "test-org-to-delete",
    display_name: "Test Organization to Delete",
  })
  const org = createResponse.data.org

  const deleteResponse = await jane_axios.post("/api/orgs/delete", {
    org_id: org.org_id,
  })

  expect(deleteResponse.status).toBe(200)
  expect(deleteResponse.data.success).toBe(true)

  try {
    await jane_axios.get("/api/orgs/get", {
      params: { org_id: org.org_id },
    })
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
  }
})

test("POST /api/orgs/delete - should fail for non-owner (403)", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  const createResponse = await jane_axios.post("/api/orgs/create", {
    name: "test-org-protected",
    display_name: "Test Organization Protected",
  })
  const org = createResponse.data.org

  try {
    await axios.post("/api/orgs/delete", {
      org_id: org.org_id,
    })
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})

test("POST /api/orgs/delete - should fail for personal org (400)", async () => {
  const { jane_axios, seed } = await getTestServer()

  const personalOrgId = seed.organization2.org_id

  try {
    await jane_axios.post("/api/orgs/delete", {
      org_id: personalOrgId,
    })
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("cannot_delete_personal_org")
  }
})

test("POST /api/orgs/delete - should fail for non-existent org (404)", async () => {
  const { jane_axios } = await getTestServer()

  try {
    await jane_axios.post("/api/orgs/delete", {
      org_id: "non-existent-org-id",
    })
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("org_not_found")
  }
})
