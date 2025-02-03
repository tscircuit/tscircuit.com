import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create package release", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post(
    "/api/packages/create",
    {
      name: "test-package",
      description: "Test Description",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })

  expect(releaseResponse.status).toBe(200)
  expect(releaseResponse.data.ok).toBe(true)
  expect(releaseResponse.data.package_release).toBeDefined()
  expect(releaseResponse.data.package_release.package_id).toBe(
    createdPackage.package_id,
  )
  expect(releaseResponse.data.package_release.version).toBe("1.0.0")
  expect(releaseResponse.data.package_release.is_latest).toBe(true)
  expect(releaseResponse.data.package_release.is_locked).toBe(false)
})

test("create package release using package_name_with_version", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post(
    "/api/packages/create",
    {
      name: "test-package-2",
      description: "Test Description",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release using package_name_with_version
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_name_with_version: `${createdPackage.name}@2.0.0`,
  })

  expect(releaseResponse.status).toBe(200)
  expect(releaseResponse.data.ok).toBe(true)
  expect(releaseResponse.data.package_release).toBeDefined()
  expect(releaseResponse.data.package_release.package_id).toBe(
    createdPackage.package_id,
  )
  expect(releaseResponse.data.package_release.version).toBe("2.0.0")
  expect(releaseResponse.data.package_release.is_latest).toBe(true)
})

test("create package release - version already exists", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post(
    "/api/packages/create",
    {
      name: "test-package-3",
      description: "Test Description",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create first release
  await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })

  // Try to create release with same version
  try {
    await axios.post("/api/package_releases/create", {
      package_id: createdPackage.package_id,
      version: "1.0.0",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("version_already_exists")
    expect(error.data.error.message).toBe(
      "Version 1.0.0 already exists for this package",
    )
  }
})

test("create package release - package not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/create", {
      package_name_with_version: "non-existent-package@1.0.0",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
    expect(error.data.error.message).toBe(
      "Package not found: non-existent-package",
    )
  }
})
