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

  const addedSnippet = db.snippets[0]

  // Update the snippet
  const updatedCode = "Updated Content"
  const updatedCompiledJs = "console.log('Updated Content')"
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedSnippet.snippet_id,
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
  expect(response.data.snippet.updated_at).not.toBe(addedSnippet.created_at)

  // Verify the snippet was updated in the database
  const updatedSnippet = db.snippets[0]
  expect(updatedSnippet.code).toBe(updatedCode)
  expect(updatedSnippet.compiled_js).toBe(updatedCompiledJs)
  expect(updatedSnippet.updated_at).not.toBe(updatedSnippet.created_at)
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

  const addedSnippet = db.snippets[0]

  // Update the snippet with null compiled_js
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedSnippet.snippet_id,
      compiled_js: null,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.snippet.compiled_js).toBeNull()

  // Verify the snippet was updated in the database
  const updatedSnippet = db.snippets[0]
  expect(updatedSnippet.compiled_js).toBeNull()
})

test("update snippet datasheet URL", async () => {
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
    datasheet_url: null
  }
  db.addSnippet(snippet as any)

  const addedSnippet = db.snippets[0]

  // Update the datasheet URL
  const newUrl = "https://example.com/datasheet.pdf"
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedSnippet.snippet_id,
      datasheet_url: newUrl,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.snippet.datasheet_url).toBe(newUrl)

  // Verify the snippet was updated in the database
  const updatedSnippet = db.snippets[0]
  expect(updatedSnippet.datasheet_url).toBe(newUrl)
})
