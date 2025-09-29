import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("GET /api/packages/get - should return package by package_id", async () => {
  const { axios } = await getTestServer()

  // Create a new package using the /create endpoint
  const newPackageData = {
    name: "testuser/test-package",
    description: "A test package",
    creator_account_id: "test_account_id",
    owner_org_id: "test_org_id",
    owner_github_username: "test_github_username",
    latest_package_release_id: null,
    latest_version: null,
    license: null,
    is_source_from_github: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unscoped_name: "test-package",
    star_count: 0,
    ai_description: "test-package",
  }

  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Get the created package using the /get endpoint
  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: createdPackage.package_id },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package).toBeDefined()
})

test("GET /api/packages/get - should return 404 if package not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/packages/get", {
      params: { package_id: "non_existent_package_id" },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
    expect(error.data.error.message).toBe(
      'Package not found (searched using {"package_id":"non_existent_package_id"})',
    )
  }
})

test("GET /api/packages/get - should return package by name", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/packages/create", {
    name: "testuser/test-package",
    description: "A test package",
    creator_account_id: "test_account_id",
    owner_org_id: "test_org_id",
    owner_github_username: "test_github_username",
  })

  const getResponse = await axios.get("/api/packages/get", {
    params: { name: "testuser/test-package" },
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package).toBeDefined()
})

test("GET /api/packages/get - returns user_permissions when authenticated", async () => {
  const { axios, jane_axios, unauthenticatedAxios } = await getTestServer()

  const createResponse = await axios.post("/api/packages/create", {
    name: "testuser/auth-package",
    description: "desc",
  })

  const pkg = createResponse.data.package

  const ownerResponse = await axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })
  expect(ownerResponse.data.package.user_permissions).toEqual({
    can_read_package: true,
    can_manage_package: true,
  })

  const otherResponse = await jane_axios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })
  expect(otherResponse.data.package.user_permissions).toEqual({
    can_read_package: true,
    can_manage_package: false,
  })

  const unauthResponse = await unauthenticatedAxios.get("/api/packages/get", {
    params: { package_id: pkg.package_id },
  })
  expect(unauthResponse.data.package.user_permissions).toBeUndefined()
})
