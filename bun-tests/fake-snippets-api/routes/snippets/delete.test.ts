import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("delete snippet", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "testuser",
    code: "Test Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "testuser/TestSnippet",
    snippet_type: "package",
    description: "Test Description",
  }
  const addedSnippet: any = db.addSnippet(snippet as any)

  // Delete the snippet
  const response = await axios.post(
    "/api/snippets/delete",
    {
      snippet_id: addedSnippet.snippet_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)

  // Verify the snippet was deleted from the database
  const deletedSnippet = db.getSnippetById(addedSnippet.snippet_id)
  expect(deletedSnippet).toBeUndefined()

  // List all the snippets and verify the deleted snippet is not in the list
  const listResponse = await axios.get("/api/snippets/list")

  expect(listResponse.status).toBe(200)
  expect(listResponse.data.snippets).toHaveLength(0)
})

test("delete non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/snippets/delete",
      {
        snippet_id: "non-existent-id",
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

test("delete snippet without permission", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet with a different owner
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "otheruser",
    code: "Test Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "otheruser/TestSnippet",
    snippet_type: "package",
    description: "Test Description",
  }
  const addedSnippet: any = db.addSnippet(snippet as any)

  try {
    await axios.post(
      "/api/snippets/delete",
      {
        snippet_id: addedSnippet.snippet_id,
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
    expect(error.status).toBe(403)
    expect(error.data.error.message).toBe(
      "You don't have permission to delete this snippet",
    )
  }
})

test("delete snippet without authorization", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet
  const snippet = {
    unscoped_name: "TestSnippet",
    owner_name: "testuser",
    code: "Test Content",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    name: "testuser/TestSnippet",
    snippet_type: "package",
    description: "Test Description",
  }
  const addedSnippet = db.addSnippet(snippet as any)

  try {
    // Attempt to delete without auth header
    await axios.post("/api/snippets/delete", {
      snippet_id: addedSnippet.snippet_id,
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(403)
    expect(error.data.error.message).toBe("Unauthorized")
  }
})
