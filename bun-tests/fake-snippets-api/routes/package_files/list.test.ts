import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import * as ZT from "fake-snippets-api/lib/db/schema"
test("list package files by package_release_id", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "testuser/package-files-list",
    description: "A test package for listing files",
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
  console.log("createdRelease", createdRelease)
  // Add multiple package files to the test database
  const files = [
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/index.js",
      content: "console.log('Hello, world!');",
      is_directory: false,
      created_at: new Date().toISOString(),
    },
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/src/utils.js",
      content: "export const sum = (a, b) => a + b;",
      is_directory: false,
      created_at: new Date().toISOString(),
    },
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/README.md",
      content: "# Test Package\nThis is a test package.",
      is_directory: false,
      created_at: new Date().toISOString(),
    },
  ]

  for (const file of files) {
    db.addPackageFile(file)
  }

  // List files by package_release_id
  const listResponse = await axios.get("/api/package_files/list", {
    params: { package_release_id: createdRelease.package_release_id },
  })

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)

  expect(responseBody.package_files).toHaveLength(3)

  // Verify all files belong to the correct release
  expect(
    responseBody.package_files.every(
      (file: ZT.PackageFile) =>
        file.package_release_id === createdRelease.package_release_id,
    ),
  ).toBe(true)
})

test("list package files by package_name with latest version", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageName = "testuser/package-files-list-2"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "Another test package for listing files",
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

  // Add some package files
  const files = [
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/package.json",
      content: '{"name":"test","version":"1.0.0"}',
      is_directory: false,
      created_at: new Date().toISOString(),
    },
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/src/index.js",
      content: "export default () => 'Hello';",
      is_directory: false,
      created_at: new Date().toISOString(),
    },
  ]

  for (const file of files) {
    db.addPackageFile(file)
  }

  // List files by package_name with use_latest_version
  const listResponse = await axios.get("/api/package_files/list", {
    params: {
      package_name: packageName.replace(/^@/, ""),
      use_latest_version: true,
    },
  })

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_files).toHaveLength(2)
})

test("list package files by package_name_with_version", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageName = "testuser/package-files-list-3"
  const version = "2.0.0"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "Package for name_with_version test",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Add some package files
  const files = [
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/tsconfig.json",
      content: '{"compilerOptions":{}}',
      is_directory: false,
      created_at: new Date().toISOString(),
    },
  ]

  for (const file of files) {
    db.addPackageFile(file)
  }

  // List files by package_name_with_version
  const listResponse = await axios.get("/api/package_files/list", {
    params: {
      package_name_with_version: `${packageName}@${version}`,
    },
  })

  expect(listResponse.status).toBe(200)
  const responseBody = listResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_files).toHaveLength(1)
  expect(responseBody.package_files[0].file_path).toBe("/tsconfig.json")
})

test("list package files - 404 for non-existent package release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/package_files/list", {
      params: {
        package_release_id: "00000000-0000-0000-0000-000000000000",
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("list package files - 404 for non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/package_files/list", {
      params: {
        package_name: "non-existent-package",
        use_latest_version: true,
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Package release not found")
  }
})
