import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("create new package file with content_text", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update",
    description: "A test package for creating or updating files",
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

  // Create a package file
  const fileContent = "console.log('Hello, world!');"
  const filePath = "/index.js"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_text: fileContent,
    },
  )

  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.package_release_id).toBe(
    createdRelease.package_release_id,
  )
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.content_text).toBe(fileContent)

  // Verify the file can be retrieved using the get endpoint
  const getResponse = await axios.post("/api/package_files/get", {
    package_file_id: responseBody.package_file.package_file_id,
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package_file.file_path).toBe(filePath)
})

test("update existing package file with content_text", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-update",
    description: "A test package for updating files",
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

  // Create a package file
  const initialContent = "console.log('Initial content');"
  const filePath = "/script.js"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_text: initialContent,
    },
  )
  expect(createResponse.status).toBe(200)
  const initialFile = createResponse.data.package_file

  // Update the file
  const updatedContent = "console.log('Updated content');"
  const updateResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_text: updatedContent,
    },
  )

  expect(updateResponse.status).toBe(200)
  const responseBody = updateResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.package_file_id).toBe(
    initialFile.package_file_id,
  )
  expect(responseBody.package_file.package_release_id).toBe(
    createdRelease.package_release_id,
  )
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.content_text).toBe(updatedContent)

  // Verify the file was updated using the get endpoint
  const getResponse = await axios.post("/api/package_files/get", {
    package_file_id: responseBody.package_file.package_file_id,
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package_file.file_path).toBe(filePath)
})

test("create package file with content_base64", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-base64",
    description: "A test package for creating files with base64",
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

  // Create a package file with base64 content
  const fileContent = "export const sum = (a, b) => a + b;"
  const base64Content = Buffer.from(fileContent).toString("base64")
  const filePath = "/utils.js"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_base64: base64Content,
    },
  )

  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.content_text).toBe(fileContent)

  // Verify the file can be retrieved using the get endpoint
  const getResponse = await axios.post("/api/package_files/get", {
    package_file_id: responseBody.package_file.package_file_id,
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package_file.file_path).toBe(filePath)
})

test("create package file using package_name_with_version", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageName = "@test/package-files-create-or-update-by-name"
  const version = "2.0.0"
  const packageResponse = await axios.post("/api/packages/create", {
    name: packageName,
    description: "A test package for creating files by name",
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

  // Create a package file using package_name_with_version
  const fileContent = "# README\nThis is a test package."
  const filePath = "/README.md"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_name_with_version: `${packageName}@${version}`,
      file_path: filePath,
      content_text: fileContent,
    },
  )

  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.file_path).toBe(filePath)
  expect(responseBody.package_file.content_text).toBe(fileContent)

  // Verify the file can be retrieved using the list endpoint
  const listResponse = await axios.post("/api/package_files/list", {
    package_name_with_version: `${packageName}@${version}`,
  })
  expect(listResponse.status).toBe(200)
  expect(listResponse.data.ok).toBe(true)
  expect(listResponse.data.package_files.length).toBeGreaterThan(0)
  const foundFile = listResponse.data.package_files.find(
    (file: any) => file.file_path === filePath,
  )
  expect(foundFile).toBeDefined()
})

test("create release tarball package file", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-tarball",
    description: "A test package for creating tarball files",
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

  // Create a release tarball package file
  const npmPackOutput = { filename: "test-1.0.0.tgz", size: 1024 }
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/test-1.0.0.tgz",
      content_text: "tarball content",
      is_release_tarball: true,
      npm_pack_output: npmPackOutput,
    },
  )

  expect(createResponse.status).toBe(200)
  const responseBody = createResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.package_release_id).toBe(
    createdRelease.package_release_id,
  )
  expect(responseBody.package_file.file_path).toBe("/test-1.0.0.tgz")
  expect(responseBody.package_file.content_text).toBe("tarball content")
  expect(responseBody.package_file.is_release_tarball).toBe(true)
  expect(responseBody.package_file.npm_pack_output).toEqual(npmPackOutput)
})

test("create_or_update - 404 for non-existent package release", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_release_id: "non-existent-id",
      file_path: "/test.js",
      content_text: "console.log('test');",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("create_or_update - 404 for non-existent package", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_name_with_version: "non-existent-package@1.0.0",
      file_path: "/test.js",
      content_text: "console.log('test');",
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("package_release_not_found")
    expect(error.data.error.message).toBe("Package release not found")
  }
})

test("create_or_update - 400 for missing content", async () => {
  const { axios } = await getTestServer()

  // First create a package and release
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-error",
    description: "A test package for error cases",
  })
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })
  const createdRelease = releaseResponse.data.package_release

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_release_id: createdRelease.package_release_id,
      file_path: "/test.js",
      // Missing both content_text and content_base64
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toContain("content")
  }
})

test("create_or_update - 400 for both content_text and content_base64", async () => {
  const { axios } = await getTestServer()

  // First create a package and release
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-error-2",
    description: "Another test package for error cases",
  })
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })
  const createdRelease = releaseResponse.data.package_release

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_release_id: createdRelease.package_release_id,
      file_path: "/test.js",
      content_text: "console.log('test');",
      content_base64: "Y29uc29sZS5sb2coJ3Rlc3QnKTs=", // Both content_text and content_base64
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.message).toContain("content")
  }
})

test("create_or_update - 400 for release tarball without npm_pack_output", async () => {
  const { axios } = await getTestServer()

  // First create a package and release
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-tarball-error",
    description: "Test package for tarball error cases",
  })
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })
  const createdRelease = releaseResponse.data.package_release

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_release_id: createdRelease.package_release_id,
      file_path: "/test-1.0.0.tgz",
      content_text: "tarball content",
      is_release_tarball: true,
      // Missing npm_pack_output
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.error_code).toBe("missing_options")
    expect(error.data.error.message).toBe(
      "npm_pack_output is required for release tarballs",
    )
  }
})

test("create_or_update - 404 for npm_pack_output without is_release_tarball", async () => {
  const { axios } = await getTestServer()

  // First create a package and release
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-create-or-update-tarball-error-2",
    description: "Test package for tarball error cases",
  })
  const createdPackage = packageResponse.data.package

  const releaseResponse = await axios.post("/api/package_releases/create", {
    package_id: createdPackage.package_id,
    version: "1.0.0",
  })
  const createdRelease = releaseResponse.data.package_release

  try {
    await axios.post("/api/package_files/create_or_update", {
      package_release_id: createdRelease.package_release_id,
      file_path: "/test.js",
      content_text: "console.log('test');",
      npm_pack_output: { filename: "test.tgz", size: 1024 },
      // Missing is_release_tarball: true
    })
    throw new Error("Expected request to fail")
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.error_code).toBe("invalid_options")
    expect(error.data.error.message).toBe(
      "npm_pack_output is only valid for release tarballs",
    )
  }
})

test("update package file with content_base64", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-update-base64",
    description: "A test package for updating files with base64",
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

  // Create a package file
  const initialContent = "console.log('Initial content');"
  const filePath = "/script.js"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_text: initialContent,
    },
  )
  expect(createResponse.status).toBe(200)
  const initialFile = createResponse.data.package_file

  // Update the file with base64 content
  const updatedContent = "console.log('Updated with base64');"
  const base64Content = Buffer.from(updatedContent).toString("base64")
  const updateResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: filePath,
      content_base64: base64Content,
    },
  )

  expect(updateResponse.status).toBe(200)
  const responseBody = updateResponse.data
  expect(responseBody.ok).toBe(true)
  expect(responseBody.package_file).toBeDefined()
  expect(responseBody.package_file.package_file_id).toBe(
    initialFile.package_file_id,
  )
  expect(responseBody.package_file.content_text).toBe(updatedContent)

  // Verify the file was updated using the get endpoint
  const getResponse = await axios.post("/api/package_files/get", {
    package_file_id: responseBody.package_file.package_file_id,
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.package_file.file_path).toBe(filePath)
})

test("create_or_update detects correct content mimetype", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-mimetype",
    description: "A test package for testing mimetypes",
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

  // Test different file extensions
  const testCases = [
    { ext: ".ts", path: "/file.ts", expected: "text/typescript" },
    { ext: ".tsx", path: "/file.tsx", expected: "text/typescript" },
    { ext: ".js", path: "/file.js", expected: "application/javascript" },
    { ext: ".json", path: "/file.json", expected: "application/json" },
    { ext: ".md", path: "/file.md", expected: "text/markdown" },
    { ext: ".html", path: "/file.html", expected: "text/html" },
    { ext: ".css", path: "/file.css", expected: "text/css" },
    {
      ext: ".unknown",
      path: "/file.unknown",
      expected: "application/octet-stream",
    },
  ]

  for (const testCase of testCases) {
    const createResponse = await axios.post(
      "/api/package_files/create_or_update",
      {
        package_release_id: createdRelease.package_release_id,
        file_path: testCase.path,
        content_text: `Test content for ${testCase.ext} file`,
      },
    )

    expect(createResponse.status).toBe(200)
    expect(createResponse.data.package_file.content_mimetype).toBe(
      testCase.expected,
    )
  }
})

test("create_or_update respects provided content_mimetype", async () => {
  const { axios } = await getTestServer()

  // First create a package
  const packageResponse = await axios.post("/api/packages/create", {
    name: "@test/package-files-custom-mimetype",
    description: "A test package for custom mimetypes",
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

  // Create a file with custom mimetype
  const customMimetype = "application/custom+json"
  const createResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_release_id: createdRelease.package_release_id,
      file_path: "/data.json",
      content_text: '{"custom":true}',
      content_mimetype: customMimetype,
    },
  )

  expect(createResponse.status).toBe(200)
  expect(createResponse.data.package_file.content_mimetype).toBe(customMimetype)
})
