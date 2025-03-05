import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("download package file by package_file_id", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-download",
    description: "A test package for downloading files",
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
  const fileContent = "console.log('Hello, world!');"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: "/index.js",
    content_text: fileContent,
    is_directory: false,
    created_at: new Date().toISOString(),
  }

  const addedFile = db.addPackageFile(packageFile)

  // Download the file by package_file_id
  const downloadResponse = await axios.get("/api/package_files/download", {
    params: { package_file_id: addedFile.package_file_id },
    responseType: "text",
  })

  expect(downloadResponse.status).toBe(200)
  expect(downloadResponse.data).toBe(fileContent)
  expect(downloadResponse.headers.get("content-type")).toContain("text/plain")
  expect(downloadResponse.headers.get("content-disposition")).toContain(
    "attachment",
  )
  expect(downloadResponse.headers.get("content-disposition")).toContain(
    "index.js",
  )
})

test("download package file by package_name_with_version and file_path", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageName = "@test/package-download-2"
  const version = "2.0.0"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "Another test package for downloading files",
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

  // Add a package file to the test database
  const filePath = "/src/utils.js"
  const fileContent = "export const sum = (a, b) => a + b;"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content_text: fileContent,
    is_directory: false,
    created_at: new Date().toISOString(),
  }

  db.addPackageFile(packageFile)

  // Download the file by package_name_with_version and file_path
  const downloadResponse = await axios.get("/api/package_files/download", {
    params: {
      package_name_with_version: `${packageName}@${version}`,
      file_path: filePath,
    },
    responseType: "text",
  })

  expect(downloadResponse.status).toBe(200)
  expect(downloadResponse.data).toBe(fileContent)
  expect(downloadResponse.headers.get("content-type")).toContain("text/plain")
  expect(downloadResponse.headers.get("content-disposition")).toContain(
    "attachment",
  )
  expect(downloadResponse.headers.get("content-disposition")).toContain(
    "utils.js",
  )
})

test("download package file - 404 for non-existent package file", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/package_files/download", {
      params: { package_file_id: "non-existent-id" },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("not_found")
    expect(error.data.error.message).toBe("Package file not found")
  }
})

test("download package file - 404 for non-existent package release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/package_files/download", {
      params: {
        package_name_with_version: "non-existent-package@1.0.0",
        file_path: "/index.js",
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("download package file - 404 for non-existent file path", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageName = "@test/package-download-3"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "Test package for non-existent file path",
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
    content_text: "console.log('Hello');",
    is_directory: false,
    created_at: new Date().toISOString(),
  }

  db.addPackageFile(packageFile)

  try {
    await axios.get("/api/package_files/download", {
      params: {
        package_name_with_version: `${packageName}@1.0.0`,
        file_path: "/non-existent-file.js",
      },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("not_found")
    expect(error.data.error.message).toBe("Package file not found")
  }
})

test("download package file - 400 for invalid parameters", async () => {
  const { axios } = await getTestServer()

  try {
    // Missing both package_file_id and package_name_with_version
    await axios.get("/api/package_files/download", {
      params: { some_other_param: "value" },
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    // The error might be from the route spec validation
    expect(error.data.message).toBeDefined()
  }
})

test("download package file with POST method", async () => {
  const { axios, db } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-download-post",
    description: "Test package for POST download",
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
  const fileContent = "// POST download test"
  const packageFile = {
    package_release_id: createdRelease.package_release_id,
    file_path: "/post-test.js",
    content_text: fileContent,
    is_directory: false,
    created_at: new Date().toISOString(),
  }

  const addedFile = db.addPackageFile(packageFile)

  // Download the file using POST method
  const downloadResponse = await axios.post(
    "/api/package_files/download",
    null,
    {
      params: { package_file_id: addedFile.package_file_id },
      responseType: "text",
    },
  )

  expect(downloadResponse.status).toBe(200)
  expect(downloadResponse.data).toBe(fileContent)
})
