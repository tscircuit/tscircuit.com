import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("update package release", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package",
    description: "Test Description",
  })
  const packageId = packageResponse.data.package.package_id

  // Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  const release = releaseResponse.data.package_release

  // Update the package release
  const response = await axios.post("/api/package_releases/update", {
    package_release_id: release.package_release_id,
    is_locked: true,
    license: "MIT",
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the release was updated
  const updatedRelease = db.packageReleases.find(
    (pr) => pr.package_release_id === release.package_release_id,
  )
  expect(updatedRelease?.is_locked).toBe(true)
  expect(updatedRelease?.license).toBe("MIT")
})

test("update package release using package_name_with_version", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-2",
    description: "Test Description",
  })
  const packageName = packageResponse.data.package.name
  const version = "2.0.0"

  // Create a package release
  await axios.post("/api/package_releases/create", {
    package_id: packageResponse.data.package.package_id,
    version,
    is_latest: true,
  })

  // Update using package_name_with_version
  const response = await axios.post("/api/package_releases/update", {
    package_name_with_version: `${packageName}@${version}`,
    is_locked: true,
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the release was updated
  const updatedRelease = db.packageReleases.find((pr) => pr.version === version)
  expect(updatedRelease?.is_locked).toBe(true)
})

test.skip("update package release - handle is_latest flag", async () => {
  const { axios, db } = await getTestServer()

  // Create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-3",
    description: "Test Description",
  })
  const packageId = packageResponse.data.package.package_id

  // Create two releases
  const release1 = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })
  const release2 = await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "2.0.0",
    is_latest: false,
  })

  // Update second release to be latest
  await axios.post("/api/package_releases/update", {
    package_release_id: release2.data.package_release.package_release_id,
    is_latest: true,
  })

  // Verify first release is no longer latest
  const firstRelease = db.packageReleases.find(
    (pr) =>
      pr.package_release_id ===
      release1.data.package_release.package_release_id,
  )
  expect(firstRelease?.is_latest).toBe(false)

  // Verify second release is now latest
  const secondRelease = db.packageReleases.find(
    (pr) =>
      pr.package_release_id ===
      release2.data.package_release.package_release_id,
  )
  expect(secondRelease?.is_latest).toBe(true)
})

test("update non-existent package release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_releases/update", {
      package_release_id: "123e4567-e89b-12d3-a456-426614174000",
      is_locked: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("update package release - no fields provided", async () => {
  const { axios } = await getTestServer()

  // Create a package and release first
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package-4",
    description: "Test Description",
  })
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: packageResponse.data.package.package_id,
    version: "1.0.0",
  })

  try {
    await axios.post("/api/package_releases/update", {
      package_release_id:
        releaseResponse.data.package_release.package_release_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("no_fields_provided")
    expect(error.data.error.message).toBe("No fields provided to update")
  }
})
