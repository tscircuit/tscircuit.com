import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get is_starred for snippet after adding star", async () => {
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

  // Add star to the snippet
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

  // Get is_starred for the snippet
  const response = await axios.get(
    `/api/snippets/get_star?snippet_id=${addedSnippet.snippet_id}`,
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.is_starred).toBe(true)

  // Verify star was added in database
  expect(db.hasStarred("account-1234", addedSnippet.snippet_id)).toBe(true)
})

test("get is_starred for non-existent snippet", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get(`/api/snippets/get_star?snippet_id=non-existent-id`, {
      headers: {
        Authorization: "Bearer 1234",
      },
    })
    expect(true).toBe(false) // Should not reach here
  } catch (error: any) {
    expect(error.status).toBe(404)
  }
})

test("get is_starred for snippet after removing star", async () => {
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

  // First star the snippet
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

  // Then remove the star
  await axios.post(
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

  // Get is_starred for the snippet
  const response = await axios.get(
    `/api/snippets/get_star?snippet_id=${addedSnippet.snippet_id}`,
    {
      headers: {
        Authorization: "Bearer 1234",
      },
    },
  )

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.is_starred).toBe(false)

  // Verify star was removed from database
  expect(db.hasStarred("account-1234", addedSnippet.snippet_id)).toBe(false)
})
