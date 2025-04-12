import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("delete package file using package_release_id", async () => {
  const { axios } = await getTestServer()

  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-delete",
    description: "A test package for deleting files",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  const filePath = "/index.js"
  const createResponse = await axios.post("/api/package_files/create", {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content_text: "console.log('Hello, world!');",
  })
  expect(createResponse.status).toBe(200)
  const createdFile = createResponse.data.package_file

  const deleteResponse = await axios.post("/api/package_files/delete", {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
  })

  expect(deleteResponse.status).toBe(200)
  expect(deleteResponse.data.ok).toBe(true)

  try {
    await axios.post("/api/package_files/get", {
      package_file_id: createdFile.package_file_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.message).toBe("Package file not found")
  }
})

test("delete package file using package_name_with_version", async () => {
  const { axios } = await getTestServer()

  const packageName = "@test/package-files-delete-by-name"
  const version = "2.0.0"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "A test package for deleting files by name",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version,
    is_latest: true,
  })
  expect(releaseResponse.status).toBe(200)

  const filePath = "/README.md"
  const createResponse = await axios.post("/api/package_files/create", {
    package_name_with_version: `${packageName}@${version}`,
    file_path: filePath,
    content_text: "# Test Package\nThis is a test package.",
  })
  expect(createResponse.status).toBe(200)
  const createdFile = createResponse.data.package_file

  const deleteResponse = await axios.post("/api/package_files/delete", {
    package_name_with_version: `${packageName}@${version}`,
    file_path: filePath,
  })

  expect(deleteResponse.status).toBe(200)
  expect(deleteResponse.data.ok).toBe(true)

  try {
    await axios.post("/api/package_files/get", {
      package_file_id: createdFile.package_file_id,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.message).toBe("Package file not found")
  }
})

test("delete package file - 404 for non-existent package name", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/delete", {
      package_name_with_version: "non-existent-id",
      file_path: "/test.js",
    })
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("delete package file - 404 for non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/delete", {
      package_name_with_version: "non-existent-package@1.0.0",
      file_path: "/test.js",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("delete package file - 404 for non-existent file", async () => {
  const { axios } = await getTestServer()

  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-delete-error",
    description: "A test package for delete error cases",
  })
  expect(packageResponse.status).toBe(200)
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  try {
    await axios.post("/api/package_files/delete", {
      package_release_id: createdRelease.package_release_id,
      file_path: "/non-existent-file.js",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("file_not_found")
    expect(error.data.error.message).toBe("Package file not found")
  }
})

test("delete package file - 403 for unauthorized user", async () => {
  const { axios, db } = await getTestServer()

  const pkg = {
    name: "@test/package-files-delete-unauthorized",
    owner_org_id: "different-org",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    description: "A test package for unauthorized delete",
  }
  const addedPackage: any = db.addPackage(pkg as any)

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: addedPackage.package_id,
    version: "1.0.0",
  })
  expect(releaseResponse.status).toBe(200)
  const createdRelease = releaseResponse.data.package_release

  const filePath = "/test.js"
  const createResponse = await axios.post("/api/package_files/create", {
    package_release_id: createdRelease.package_release_id,
    file_path: filePath,
    content_text: "console.log('test');",
  })
  expect(createResponse.status).toBe(200)

  try {
    await axios.post("/api/package_files/delete", {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.error_code).toBe("forbidden")
    expect(error.data.error.message).toBe(
      "You don't have permission to delete files in this package",
    )
  }
})

test("delete package file - 400 when neither package_release_id nor package_name_with_version is provided", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/delete", {
      file_path: "/test.js",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    console.log(59, error)
    expect(error.status).toBe(400)
    expect(error.data.message).toInclude(
      "Must specify either package_release_id or package_name_with_version",
    )
  }
})

test("delete package file - 400 when both package_release_id and package_name_with_version are provided", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/delete", {
      package_release_id: "some-id",
      package_name_with_version: "@test/package@1.0.0",
      file_path: "/test.js",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toInclude(
      "Cannot specify both package_release_id and package_name_with_version",
    )
  }
})
