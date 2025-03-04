import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("update snippet", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "testuser",
    code: "Original Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "testuser/TestSnippet",
    snippet_type: "package",
    description: "Original Description",
    compiled_js: null,
  }
  db.addSnippet(snippet as any)

  const addedPackage = db.packages[0]

  // Update the snippet
  const updatedCode = "Updated Content"
  const updatedCompiledJs = "console.log('Updated Content')"
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedPackage.package_id,
      code: updatedCode,
      compiled_js: updatedCompiledJs,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.snippet.code).toBe(updatedCode)
  expect(response.data.snippet.compiled_js).toBe(updatedCompiledJs)
  expect(response.data.snippet.updated_at).not.toBe(addedPackage.created_at)

  // Verify the snippet was updated in the database
  const updatedPackageFiles = db.packageFiles.filter(
    (p) => p.package_release_id === addedPackage.latest_package_release_id,
  )
  expect(updatedPackageFiles.length).toBe(3)
  expect(updatedPackageFiles[0].content_text).toBe(updatedCode)
  expect(updatedPackageFiles[1].content_text).toBe("") // dts
  expect(updatedPackageFiles[2].content_text).toBe(updatedCompiledJs)
})

test("update non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/snippets/update",
      {
        snippet_id: "non-existent-id",
        code: "Updated Content",
        compiled_js: "console.log('Updated Content')",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Snippet not found")
  }
})

test("update snippet with null compiled_js", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet with compiled_js
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "testuser",
    code: "Original Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "testuser/TestSnippet",
    snippet_type: "package",
    description: "Original Description",
    compiled_js: "console.log('Original Content')",
  }
  db.addSnippet(snippet as any)

  const addedPackage = db.packages[0]

  // Update the snippet with null compiled_js
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedPackage.package_id,
      compiled_js: "",
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.snippet.compiled_js).toBeEmpty()

  // Verify the snippet was updated in the database
  const updatedPackageFiles = db.packageFiles.filter(
    (p) => p.package_release_id === addedPackage.latest_package_release_id,
  )
  expect(updatedPackageFiles.length).toBe(3)
  expect(updatedPackageFiles[0].content_text).toBe(snippet.code)
  expect(updatedPackageFiles[1].content_text).toBe("")
})
