import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("updating a file after a package rename", async () => {
  const { axios, db } = await getTestServer()

  // 1. Create a package
  const createResponse = await axios.post("/api/packages/create", {
    name: "testuser/my-package",
    description: "A test package",
  })
  const packageId = createResponse.data.package.package_id
  const initialName = createResponse.data.package.name

  // 2. Create a package release
  await axios.post("/api/package_releases/create", {
    package_id: packageId,
    version: "1.0.0",
    is_latest: true,
  })

  // 3. Create a file in the package
  await axios.post("/api/package_files/create_or_update", {
    package_name_with_version: `${initialName}@latest`,
    file_path: "README.md",
    content_text: "Initial content",
  })

  // 4. Rename the package
  const updatedName = "testuser/my-renamed-package"
  await axios.post("/api/packages/update", {
    package_id: packageId,
    name: "my-renamed-package",
  })

  // 5. Try to update the file using the OLD name (should fail)
  try {
    await axios.post("/api/package_files/create_or_update", {
      package_name_with_version: `${initialName}@latest`,
      file_path: "README.md",
      content_text: "This should not work",
    })
    // If this doesn't throw, the test should fail
    throw new Error("File update with old name should have failed but succeeded.")
  } catch (error: any) {
    expect(error.status).toBe(404) // Expect 'Not Found' or similar error
    expect(error.data.error.error_code).toBe("package_release_not_found")
  }

  // 6. Update the file using the NEW name (should succeed)
  const updateResponse = await axios.post(
    "/api/package_files/create_or_update",
    {
      package_name_with_version: `${updatedName}@latest`,
      file_path: "README.md",
      content_text: "Updated content",
    },
  )

  expect(updateResponse.status).toBe(200)
  expect(updateResponse.data.package_file.content_text).toBe("Updated content")

  // 7. Verify the file content in the database
  const release = db.packageReleases.find(
    (r) => r.package_id === packageId && r.is_latest,
  )
  const file = db.packageFiles.find(
    (f) =>
      f.package_release_id === release?.package_release_id &&
      f.file_path === "README.md",
  )

  expect(file?.content_text).toBe("Updated content")
}, 20000)
