import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("list package releases", async () => {
  const { axios, db } = await getTestServer()

  // First create a test package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/test-package",
    description: "Test Description",
  })
  const packageId = packageResponse.data.package.package_id

  // Add some test package releases
  const releases = [
    {
      package_id: packageId,
      version: "1.0.0",
      is_latest: false,
      commit_sha: "abc123",
      is_locked: false,
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      package_id: packageId,
      version: "1.1.0",
      is_latest: false,
      commit_sha: "def456",
      is_locked: false,
      created_at: "2023-01-02T00:00:00Z",
    },
    {
      package_id: packageId,
      version: "2.0.0",
      is_latest: true,
      commit_sha: "ghi789",
      is_locked: false,
      created_at: "2023-01-03T00:00:00Z",
    },
  ]

  for (const release of releases) {
    db.addPackageRelease(release as any)
  }

  // Test listing by package_id
  const { data: packageIdData } = await axios.post(
    "/api/package_releases/list",
    {
      package_id: packageId,
    },
  )
  expect(packageIdData.ok).toBe(true)
  expect(packageIdData.package_releases).toHaveLength(3)
  expect(packageIdData.package_releases[0].package_id).toBe(packageId)

  // Test listing by package_name
  const { data: packageNameData } = await axios.post(
    "/api/package_releases/list",
    {
      package_name: "testuser/test-package",
    },
  )
  expect(packageNameData.ok).toBe(true)
  expect(packageNameData.package_releases).toHaveLength(3)

  // Test listing latest releases only
  const { data: latestData } = await axios.post("/api/package_releases/list", {
    package_id: packageId,
    is_latest: true,
  })
  expect(latestData.ok).toBe(true)
  expect(latestData.package_releases).toHaveLength(1)
  expect(latestData.package_releases[0].version).toBe("2.0.0")
  expect(latestData.package_releases[0].is_latest).toBe(true)

  // Test listing by specific version
  const { data: versionData } = await axios.post("/api/package_releases/list", {
    package_id: packageId,
    version: "1.0.0",
  })
  expect(versionData.ok).toBe(true)
  expect(versionData.package_releases).toHaveLength(1)
  expect(versionData.package_releases[0].version).toBe("1.0.0")

  // Test listing by commit_sha
  const { data: commitData } = await axios.post("/api/package_releases/list", {
    package_id: packageId,
    commit_sha: "abc123",
  })
  expect(commitData.ok).toBe(true)
  expect(commitData.package_releases).toHaveLength(1)
  expect(commitData.package_releases[0].commit_sha).toBe("abc123")
})

test("list package releases - validation errors", async () => {
  const { axios } = await getTestServer()

  // Test error when both package_id and package_name provided
  try {
    await axios.post("/api/package_releases/list", {
      package_id: "some-id",
      package_name: "some-name",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toContain(
      "package_id and package_name are mutually exclusive",
    )
  }

  // Test error when neither package_id nor package_name provided
  try {
    await axios.post("/api/package_releases/list", {
      is_latest: true,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toContain(
      "package_id or package_name is required",
    )
  }
})

test("list package releases - non-existent package", async () => {
  const { axios } = await getTestServer()

  // Test with non-existent package_name
  const { data: nonExistentData } = await axios.post(
    "/api/package_releases/list",
    {
      package_name: "non-existent-package",
    },
  )
  expect(nonExistentData.ok).toBe(true)
  expect(nonExistentData.package_releases).toHaveLength(0)

  // Test with non-existent package_id
  const { data: nonExistentIdData } = await axios.post(
    "/api/package_releases/list",
    {
      package_id: "123e4567-e89b-12d3-a456-426614174000",
    },
  )
  expect(nonExistentIdData.ok).toBe(true)
  expect(nonExistentIdData.package_releases).toHaveLength(0)
})
