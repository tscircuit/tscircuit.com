import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
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
  }
  db.addSnippet(snippet as any)

  const addedSnippet = db.snippets[0]

  // Update the snippet
  const updatedCode = "Updated Content"
  const response = await axios.post(
    "/api/snippets/update",
    {
      snippet_id: addedSnippet.snippet_id,
      code: updatedCode,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.snippet.code).toBe(updatedCode)
  expect(response.data.snippet.updated_at).not.toBe(addedSnippet.created_at)

  // Verify the snippet was updated in the database
  const updatedSnippet = db.snippets[0]
  expect(updatedSnippet.code).toBe(updatedCode)
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
