import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test.todo(
  "POST /api/orgs/remove_member - should remove a user from an org (resets to personal org)",
  async () => {
    const { jane_axios, seed } = await getTestServer()

    const createResponse = await jane_axios.post("/api/orgs/create", {
      name: "globex",
    })
    const org = createResponse.data.org

    await jane_axios.post("/api/orgs/add_member", {
      org_id: org.org_id,
      account_id: seed.account.account_id,
    })

    const removeResponse = await jane_axios.post("/api/orgs/remove_member", {
      org_id: org.org_id,
      account_id: seed.account.account_id,
    })

    expect(removeResponse.status).toBe(200)
    expect(removeResponse.data).toEqual({})
  },
)

test("POST /api/orgs/remove_member - should fail for non-owner (403)", async () => {
  const { jane_axios, axios, seed } = await getTestServer()

  const createResponse = await jane_axios.post("/api/orgs/create", {
    name: "initech",
  })
  const org = createResponse.data.org

  await jane_axios.post("/api/orgs/add_member", {
    org_id: org.org_id,
    account_id: seed.account.account_id,
  })

  try {
    await axios.post("/api/orgs/remove_member", {
      org_id: org.org_id,
      account_id: seed.account2.account_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("not_authorized")
  }
})
