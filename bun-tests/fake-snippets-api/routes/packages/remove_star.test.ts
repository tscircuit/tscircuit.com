import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("remove star from package using package_id", async () => {
  const { axios } = await getTestServer()

  // Create a test package
  const newPackageData = {
    name: "testuser/test-package",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Star the package first
  await axios.post("/api/packages/add_star", {
    package_id: createdPackage.package_id,
  })

  // Remove star from package
  const response = await axios.post("/api/packages/remove_star", {
    package_id: createdPackage.package_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify star was removed by checking the package again
  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: createdPackage.package_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package.star_count).toBe(0)
})

test("remove star from package using name", async () => {
  const { axios } = await getTestServer()

  // Create a test package
  const newPackageData = {
    name: "testuser/test-package-2",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Star the package first
  await axios.post("/api/packages/add_star", {
    package_id: createdPackage.package_id,
  })

  // Remove star using name
  const response = await axios.post("/api/packages/remove_star", {
    name: createdPackage.name,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify star was removed by checking the package again
  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: createdPackage.package_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package.star_count).toBe(0)
})

test("remove star from non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/packages/remove_star", {
      package_id: "non-existent-id",
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("remove star from non-existent package by name", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/packages/remove_star", {
      name: "non-existent-package",
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("remove star from unstarred package", async () => {
  const { axios } = await getTestServer()

  // Create a test package
  const newPackageData = {
    name: "testuser/test-package-3",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Try to remove star without starring first
  try {
    await axios.post("/api/packages/remove_star", {
      package_id: createdPackage.package_id,
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.message).toBe("You have not starred this package")
  }
})
