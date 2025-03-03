import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("star count is updated correctly", async () => {
  const { axios, db } = await getTestServer()

  // Create a snippet using the API
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
  const createResponse = await axios.post("/api/snippets/create", snippet)
  expect(createResponse.status).toBe(200)
  const createdSnippet = createResponse.data.snippet

  db.addStar("user1", createdSnippet.snippet_id)
  db.addStar("user2", createdSnippet.snippet_id)
  db.addStar("user3", createdSnippet.snippet_id)

  // Test star count in list endpoint
  const listResponse = await axios.get("/api/snippets/list")
  expect(listResponse.status).toBe(200)
  expect(listResponse.data.snippets[0].star_count).toBe(3)

  // Test star count in get endpoint
  const getResponse = await axios.get("/api/snippets/get", {
    params: { snippet_id: createdSnippet.snippet_id },
  })
  expect(getResponse.status).toBe(200)
  expect(getResponse.data.snippet.star_count).toBe(3)

  await axios.post(
    "/api/snippets/add_star",
    { snippet_id: createdSnippet.snippet_id },
  )

  // Remove a star using the API
  await axios.post(
    "/api/snippets/remove_star",
    { snippet_id: createdSnippet.snippet_id },
  )

  // Verify updated star count
  const updatedListResponse = await axios.get("/api/snippets/list")
  expect(updatedListResponse.status).toBe(200)
  expect(updatedListResponse.data.snippets[0].star_count).toBe(3)
})
