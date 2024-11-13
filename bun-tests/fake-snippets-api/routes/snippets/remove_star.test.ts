import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("remove star from snippet", async () => {
  const { axios, db } = await getTestServer()

  // Add a test snippet
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
  const addedSnippet = db.addSnippet(snippet as any)!

  // Star the snippet
  const response = await axios.post(
    "/api/snippets/remove_star",
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
  expect(response.data.account_snippet).toBeDefined()
  expect(response.data.account_snippet.snippet_id).toBe(addedSnippet.snippet_id)
  expect(response.data.account_snippet.has_starred).toBe(false)

  // Verify star was added in database
  expect(db.hasStarred("account-1234", addedSnippet.snippet_id)).toBe(false)
})

test("remove star from non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/snippets/add_star",
      {
        snippet_id: "non-existent-id",
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )

    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Snippet not found")
  }
})
