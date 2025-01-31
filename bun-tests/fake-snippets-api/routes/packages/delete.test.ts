import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("delete package", async () => {
  const { axios, db } = await getTestServer()

  // Add a test package
  const pkg = {
    name: "test-package",
    owner_org_id: "org-1234", // Changed to match the default auth context's personal_org_id
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    description: "Test Description",
  }
  const addedPackage: any = db.addPackage(pkg as any)

  // Delete the package
  const response = await axios.post(
    "/api/packages/delete",
    {
      package_id: addedPackage.package_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the package was deleted from the database
  const deletedPackage = db.getPackageById(addedPackage.package_id)
  expect(deletedPackage).toBeUndefined()

  // List all the packages and verify the deleted package is not in the list
  const listResponse = await axios.get("/api/packages/list")

  expect(listResponse.status).toBe(200)
  expect(listResponse.data.packages).toHaveLength(0)
})

test("delete non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/packages/delete",
      {
        package_id: "non-existent-id",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("delete package without permission", async () => {
  const { axios, db } = await getTestServer()

  // Add a test package with a different owner org
  const pkg = {
    name: "test-package",
    owner_org_id: "different-org", // Different from the personal_org_id in auth
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    description: "Test Description",
  }
  const addedPackage: any = db.addPackage(pkg as any)

  try {
    await axios.post(
      "/api/packages/delete",
      {
        package_id: addedPackage.package_id,
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.message).toBe(
      "You don't have permission to delete this package",
    )
  }
})
