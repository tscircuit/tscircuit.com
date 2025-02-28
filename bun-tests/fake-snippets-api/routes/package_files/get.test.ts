import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import { packageFileSchema } from "fake-snippets-api/lib/db/schema"

test("POST /api/package_files/get - should return package file by package_file_id", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files",
    description: "A test package for files",
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

  // Add a package file to the test database
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: "/index.js",
    content: "console.log('Hello, world!');",
    is_directory: false,
    created_at: new Date().toISOString(),
  }
  
  const addedFile = db.addPackageFile(packageFile)

  // Get the file by package_file_id
  const getResponse = await axios.post("/api/package_files/get", {
    package_file_id: addedFile.package_file_id,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toEqual(
    packageFileSchema.parse(addedFile)
  )
})

test("POST /api/package_files/get - should return package file by package_release_id and file_path", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-2",
    description: "Another test package for files",
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

  // Add a package file to the test database
  const filePath = "/src/utils.js"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content: "export const sum = (a, b) => a + b;",
    is_directory: false,
    created_at: new Date().toISOString(),
  }
  
  db.addPackageFile(packageFile)

  // Get the file by package_release_id and file_path
  const getResponse = await axios.post("/api/package_files/get", {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.package_release_id).toBe(createdRelease.package_release_id)
})

test("POST /api/package_files/get - should return package file by package_name_with_version and file_path", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageName = "@test/package-files-3"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "Package for name_with_version test",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const version = "2.0.0"
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Add a package file to the test database
  const filePath = "/README.md"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content: "# Test Package\nThis is a test package.",
    is_directory: false,
    created_at: new Date().toISOString(),
  }
  
  db.addPackageFile(packageFile)

  // Get the file by package_name_with_version and file_path
  const getResponse = await axios.post("/api/package_files/get", {
    package_name_with_version: `${packageName}@${version}`,
    file_path: filePath,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.package_release_id).toBe(createdRelease.package_release_id)
})

test("POST /api/package_files/get - should return 404 if package file not found", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/get", {
      package_file_id: "123e4567-e89b-12d3-a456-426614174000", // valid UUID format
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.message).toBe("Package file not found")
  }
})

test("POST /api/package_files/get - should return 404 if package not found with package_name", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/get", {
      package_name: "non-existent-package",
      version: "1.0.0",
      file_path: "/index.js",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.message).toContain("Package not found")
  }
})

test("POST /api/package_files/get - should return file using package_id and version", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-4",
    description: "Package for package_id and version test",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  // Create a package release
  const version = "3.0.0"
  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  // Add a package file to the test database
  const filePath = "/package.json"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content: '{"name":"test","version":"3.0.0"}',
    is_directory: false,
    created_at: new Date().toISOString(),
  }
  
  db.addPackageFile(packageFile)

  // Get the file by package_id and version
  const getResponse = await axios.post("/api/package_files/get", {
    package_id: createdPackage.package_id,
    version,
    file_path: filePath,
  })

  expect(getResponse.status).toBe(200)
  const responseBody = getResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.package_release_id).toBe(createdRelease.package_release_id)
})
