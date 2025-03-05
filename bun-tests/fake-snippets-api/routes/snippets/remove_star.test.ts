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

  const createdSnippet = await axios.post("/api/snippets/create", snippet)
  // Star the snippet
  await axios.post(
    "/api/snippets/add_star",
    {
      snippet_id: createdSnippet.data.snippet.snippet_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  // remove star from snippet
  const response = await axios.post(
    "/api/snippets/remove_star",
    {
      snippet_id: createdSnippet.data.snippet.snippet_id,
    },
    {
      headers: {
        Authorization: "Bearer 123",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.is_starred).toBe(false)

  // Verify star was removed in database
  expect(
    db.hasStarred("account-123", createdSnippet.data.snippet.snippet_id),
  ).toBe(false)
})

test("remove star from non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/snippets/remove_star",
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

test("remove star from unstarred snippet", async () => {
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
  const createdSnippet = await axios.post("/api/snippets/create", snippet)

  // Remove star
  try {
    await axios.post(
      "/api/snippets/remove_star",
      {
        snippet_id: createdSnippet.data.snippet.snippet_id,
      },
      {
        headers: {
          Authorization: "Bearer 1234",
        },
      },
    )
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(400)
    expect(error.data.error.message).toBe("You have not starred this snippet")
  }
})
