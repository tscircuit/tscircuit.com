import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orgs/create - should create a new org for the user", async () => {
  const { axios } = await getTestServer()
  const orgName = "acme-corp"
  const createResponse = await axios.post("/api/orgs/create", {
    name: orgName,
  })

  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.name).toBe(orgName)
  expect(responseBody.org.github_handle).toBeNull()
  expect(responseBody.org.tscircuit_handle).toBeNull()
  expect(responseBody.org.owner_account_id).toBe(
    String((axios.defaults.headers as any)?.["Authorization"]?.split(" ")[1]),
  )
  expect(responseBody.org.member_count).toBe(1)
  expect(responseBody.org.package_count).toBe(0)
  expect(responseBody.org.user_permissions?.can_manage_org).toBe(true)
})

test("POST /api/orgs/create - should reject duplicate org names", async () => {
  const { axios, seed } = await getTestServer()
  try {
    await axios.post("/api/orgs/create", {
      name: seed.organization.org_name,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("org_already_exists")
    expect(error.data.error.message).toBe(
      "An organization with this name already exists",
    )
  }
})

test("POST /api/orgs/create - should accept display_name and use it", async () => {
  const { axios } = await getTestServer()
  const name = "acme-corp-69"
  const displayName = "ACME Corporation"
  const createResponse = await axios.post("/api/orgs/create", {
    name: name,
    display_name: displayName,
  })
  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.github_handle).toBeNull()
  expect(responseBody.org.tscircuit_handle).toBeNull()
  expect(responseBody.org.name).toBe(name)
  expect(responseBody.org.display_name).toBe(displayName)
})

test("POST /api/orgs/create - should map name as display_name when not provided", async () => {
  const { axios, db } = await getTestServer()
  const name = "acme-corp"
  const createResponse = await axios.post("/api/orgs/create", {
    name: name,
  })
  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.org).toBeDefined()
  expect(responseBody.org.github_handle).toBeNull()
  expect(responseBody.org.tscircuit_handle).toBeNull()
  expect(responseBody.org.name).toBe(name)
  expect(responseBody.org.display_name).toBe(name)
})

test("POST /api/orgs/create - should reject invalid org names", async () => {
  const { axios } = await getTestServer()
  const invalidNames = [
    "ACME Corp",
    "acme corp",
    "acme.corp",
    "-acme",
    "acme-",
    "ac",
  ]

  for (const name of invalidNames) {
    try {
      await axios.post("/api/orgs/create", { name })
      throw new Error(`Expected request to fail for name: ${name}`)
    } catch (error: any) {
      expect(error.status).toBe(400)
    }
  }
}, 10000)

test("POST /orgs/create accepts explicit tscircuit_handle", async () => {
  const { jane_axios, db, seed } = await getTestServer()

  const tscHandle = "Custom_Handle-1"
  const orgName = "custom-handle-org"

  const {
    data: { org },
  } = await jane_axios.post("/api/orgs/create", {
    name: orgName,
    tscircuit_handle: tscHandle,
  })

  expect(org.name).toBe(orgName)
  expect(org.tscircuit_handle).toBe(tscHandle)
  expect(org.github_handle).toBeNull()

  const created = db.getOrg({
    org_id: org.org_id,
  })

  expect(created?.tscircuit_handle).toBe(tscHandle)
  expect(created?.github_handle).toBeNull()
  expect(created?.owner_account_id).toBe(seed.account2.account_id)
})
