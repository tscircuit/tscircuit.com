import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get star status of snippet", async () => {
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
  await axios.post(
    "/api/snippets/get_star",
    {
      snippet_id: addedSnippet.snippet_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  // remove star from snippet
  const response = await axios.post(
    "/api/snippets/get_star",
    {
      snippet_id: addedSnippet.snippet_id,
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
  expect(db.hasStarred("account-123", addedSnippet.snippet_id)).toBe(false)
})

test("get star status of non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.post(
      "/api/snippets/get_star",
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

test("get star status of starred snippet", async () => {
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
  const addedSnippet = db.addSnippet(snippet as any)

  // Star the snippet
  await axios.post(
    "/api/snippets/add_star",
    {
      snippet_id: addedSnippet.snippet_id,
    },
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  const response = await axios.post(
    "/api/snippets/get_star",
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
  expect(response.data.is_starred).toBe(true)
})
