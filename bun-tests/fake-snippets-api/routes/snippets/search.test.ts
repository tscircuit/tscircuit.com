import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("search snippets", async () => {
  const { axios, db } = await getTestServer()

  // Add some test snippets
  const snippets = [
    {
      unscoped_name: "Snippet1",
      owner_name: "User1",
      code: "Content1",
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2023-01-01T00:00:00Z",
      name: "User1/Snippet1",
      snippet_type: "board",
      description: "First test snippet",
    },
    {
      unscoped_name: "Snippet2",
      owner_name: "User2",
      code: "Content2 with searchable text",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      name: "User2/Snippet2",
      snippet_type: "package",
      description: "Second test snippet",
    },
    {
      unscoped_name: "Snippet3",
      owner_name: "User1",
      code: "Content3",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      name: "User1/Snippet3",
      snippet_type: "model",
      description: "Third test snippet with searchable description",
    },
  ]

  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
  }

  // Test search by name
  const nameSearchResponse = await axios.get("/api/snippets/search", {
    params: { q: "Snippet1" },
  })
  expect(nameSearchResponse.status).toBe(200)
  expect(nameSearchResponse.data.snippets).toHaveLength(1)
  expect(nameSearchResponse.data.snippets[0].name).toBe("User1/Snippet1")

  // Test search by description
  const descriptionSearchResponse = await axios.get("/api/snippets/search", {
    params: { q: "searchable description" },
  })
  expect(descriptionSearchResponse.status).toBe(200)
  expect(descriptionSearchResponse.data.snippets).toHaveLength(1)
  expect(descriptionSearchResponse.data.snippets[0].name).toBe("User1/Snippet3")

  // Test search by code content
  const codeSearchResponse = await axios.get("/api/snippets/search", {
    params: { q: "searchable text" },
  })
  expect(codeSearchResponse.status).toBe(200)
  expect(codeSearchResponse.data.snippets).toHaveLength(1)
  expect(codeSearchResponse.data.snippets[0].name).toBe("User2/Snippet2")

  // Test search with no results
  const noResultsResponse = await axios.get("/api/snippets/search", {
    params: { q: "nonexistent" },
  })
  expect(noResultsResponse.status).toBe(200)
  expect(noResultsResponse.data.snippets).toHaveLength(0)
})
