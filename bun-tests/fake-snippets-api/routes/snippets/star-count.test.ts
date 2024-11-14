import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("star count is correctly calculated", async () => {
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

  // Add some stars from different users
  db.addStar("user1", addedSnippet.snippet_id)
  db.addStar("user2", addedSnippet.snippet_id)
  db.addStar("user3", addedSnippet.snippet_id)

  // Test star count in list endpoint
  const listResponse = await axios.get("/api/snippets/list")
  expect(listResponse.status).toBe(200)
  expect(listResponse.data.snippets[0].star_count).toBe(3)

  // Test star count in get endpoint
  const getResponse = await axios.get("/api/snippets/get", {
    params: { snippet_id: addedSnippet.snippet_id },
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.snippet.star_count).toBe(3)

  // Remove a star
  db.removeStar("user2", addedSnippet.snippet_id)

  // Verify updated star count
  const updatedListResponse = await axios.get("/api/snippets/list")
  expect(updatedListResponse.status).toBe(200)
  expect(updatedListResponse.data.snippets[0].star_count).toBe(2)
})
