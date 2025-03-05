import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update package", async () => {
  const { axios, db } = await getTestServer()

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
  const packageId = packageResponse.data.package.package_id

  // Update the package
  const response = await axios.post(
    "/api/packages/update",
    {
      package_id: packageId,
      name: "updated-package",
      description: "Updated Description",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.package.name).toBe("testuser/updated-package")
  expect(response.data.package.description).toBe("Updated Description")

  // Verify the package was updated in the database
  const updatedPackage = db.packages.find((p) => p.package_id === packageId)
  expect(updatedPackage?.name).toBe("testuser/updated-package")
  expect(updatedPackage?.description).toBe("Updated Description")
})

test("update package privacy settings", async () => {
  const { axios, db } = await getTestServer()

  // Create initial public package
  const packageResponse = await axios.post(
    "/api/packages/create",
    {
      name: "public-package",
      description: "Public Package",
      is_private: false,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )
  const packageId = packageResponse.data.package.package_id

  // Update to make it private
  const response = await axios.post(
    "/api/packages/update",
    {
      package_id: packageId,
      is_private: true,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.package.is_private).toBe(true)
  expect(response.data.package.is_public).toBe(false)
  expect(response.data.package.is_unlisted).toBe(true) // Private packages should be unlisted

  // Verify in database
  const updatedPackage = db.packages.find((p) => p.package_id === packageId)
  expect(updatedPackage?.is_private).toBe(true)
  expect(updatedPackage?.is_public).toBe(false)
  expect(updatedPackage?.is_unlisted).toBe(true)
})

test("update non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/packages/update",
      {
        package_id: "non-existent-id",
        name: "updated-name",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_not_found")
    expect(error.data.error.message).toBe("Package not found")
  }
})

test("update package without permission", async () => {
  const { axios, db } = await getTestServer()

  db.addPackage({
    name: "Package3",
    unscoped_name: "Package3",
    owner_github_username: "user1",
    creator_account_id: "creator1",
    created_at: "2023-01-03T00:00:00Z",
    updated_at: "2023-01-03T00:00:00Z",
    description: "Description 3",
    ai_description: "AI Description 3",
    owner_org_id: "org1",
    latest_version: "1.0.0",
    license: "MIT",
    is_source_from_github: true,
    star_count: 0,
  } as any)

  const packageId = db.packages[0].package_id

  // Try to update with different user
  try {
    await axios.post(
      "/api/packages/update",
      {
        package_id: packageId,
        name: "stolen-package",
      },
      {
        headers: {
          Authorization: "Bearer 5678", // Different user
        },
      },
    )
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
    expect(error.data.error.message).toBe("You don't have permission to update this package")
  }
})

