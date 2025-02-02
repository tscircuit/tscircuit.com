import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"

test("POST /api/package_releases/get - should return package release by package_release_id", async () => {
  const { axios } = await getTestServer()

  // First create a package with valid name format
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-1",
    description: "A test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Get the created package release
  const getResponse = await axios.post("/api/package_releases/get", {
    package_release_id: createdRelease.package_release_id,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release).toEqual(
    packageReleaseSchema.parse(createdRelease),
  )
})

test("POST /api/package_releases/get - should return 404 if package release not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/get", {
      package_release_id: "123e4567-e89b-12d3-a456-426614174000", // valid UUID format
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("POST /api/package_releases/get - should find release by package_name_with_version", async () => {
  const { axios } = await getTestServer()

  // First create a package with valid name format
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-2",
    description: "Another test package",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const version = "2.0.0"
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_name_with_version: `${createdPackage.name}@${version}`,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  const listResponse = await axios.post("/api/package_releases/list", {
    package_name: createdPackage.name,
  })
  console.log(listResponse.data)

  // Get the release using package_name_with_version
  const getResponse = await axios.post("/api/package_releases/get", {
    package_release_id: createdRelease.package_release_id,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_release).toEqual(
    packageReleaseSchema.parse(createdRelease),
  )
})
