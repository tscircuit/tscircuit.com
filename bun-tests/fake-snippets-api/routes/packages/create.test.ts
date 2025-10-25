import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create package", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/packages/create", {
    name: "testuser/TestPackage",
    description: "Test Description",
  })

  expect(response.status).toBe(200)
  expect(response.data.package.name).toBe("testuser/TestPackage")
  expect(response.data.package.unscoped_name).toBe("TestPackage")
  expect(response.data.package.description).toBe("Test Description")
  expect(response.data.package.owner_github_username).toBe("testuser")
  expect(response.data.package.description).toBe("Test Description")
  expect(response.data.package.latest_package_release_id).toBeDefined()
  expect(response.data.package.is_private).toBe(false)
  expect(response.data.package.is_public).toBe(true)
  expect(response.data.package.is_unlisted).toBe(false)
})

test("create package with private flag", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/packages/create", {
    name: "testuser/TestPackage",
    description: "Test Description",
    is_private: true,
  })

  expect(response.status).toBe(200)
  expect(response.data.package.is_private).toBe(true)
})

test("create package under org", async () => {
  const { jane_axios, seed } = await getTestServer()

  const response = await jane_axios.post("/api/packages/create", {
    is_private: true,
    org_id: seed.organization.org_id,
    description: "Test Description",
  })

  expect(response.status).toBe(200)
  expect(response.data.package.owner_org_id).toBe(seed.organization.org_id)
  expect(response.data.package.owner_github_username).toBe(
    seed.organization.github_handle,
  )
  expect(response.data.package.is_private).toBe(true)
  expect(response.data.package.description).toBe("Test Description")
})

test("create package under non-existent org", async () => {
  const { jane_axios, seed } = await getTestServer()

  const response = await jane_axios.post(
    "/api/packages/create",
    {
      org_id: "not-existent-org-id",
    },
    {
      validateStatus: () => true,
    },
  )
  expect(response.status).toBe(404)
  expect(response.data.error.error_code).toBe("org_not_found")
})
