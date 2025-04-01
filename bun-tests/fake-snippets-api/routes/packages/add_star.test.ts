import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("add star to package using package_id", async () => {
  const { axios } = await getTestServer()

  // Create a test package using the create endpoint
  const newPackageData = {
    name: "test-package",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Star the package using package_id
  const response = await axios.post("/api/packages/add_star", {
    package_id: createdPackage.package_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify star was added by checking the package again
  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: createdPackage.package_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package.star_count).toBe(1)
  expect(getResponse.data.package.is_starred).toBe(true)
})

test("add star to package using name", async () => {
  const { axios } = await getTestServer()

  // Create a test package using the create endpoint
  const newPackageData = {
    name: "test-package-2",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Star the package using name
  const response = await axios.post("/api/packages/add_star", {
    name: createdPackage.name,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify star was added by checking the package again
  const getResponse = await axios.get("/api/packages/get", {
    params: { package_id: createdPackage.package_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package.star_count).toBe(1)
})

test("add star to non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/packages/add_star",
      {
        package_id: "non-existent-id",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("add star to non-existent package by name", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/packages/add_star",
      {
        name: "non-existent-package",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("add star to already starred package", async () => {
  const { axios } = await getTestServer()

  // Create a test package using the create endpoint
  const newPackageData = {
    name: "test-package-3",
    description: "Test Description",
  }
  const createResponse = await axios.post(
    "/api/packages/create",
    newPackageData,
  )
  expect(createResponse.status).toBe(200)
  const createdPackage = createResponse.data.package

  // Star the package first time
  await axios.post(
    "/api/packages/add_star",
    {
      package_id: createdPackage.package_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  // Try to star again
  try {
    await axios.post(
      "/api/packages/add_star",
      {
        package_id: createdPackage.package_id,
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.message).toBe(
      "You have already starred this package",
    )
  }
})
