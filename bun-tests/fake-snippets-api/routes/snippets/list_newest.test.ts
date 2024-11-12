import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list newest snippets", async () => {
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
    },
    {
      unscoped_name: "Snippet2",
      owner_name: "User2",
      code: "Content2",
      created_at: "2023-01-02T00:00:00Z",
      updated_at: "2023-01-02T00:00:00Z",
      name: "User2/Snippet2",
      snippet_type: "package",
    },
    {
      unscoped_name: "Snippet3",
      owner_name: "User3",
      code: "Content3",
      created_at: "2023-01-03T00:00:00Z",
      updated_at: "2023-01-03T00:00:00Z",
      name: "User3/Snippet3",
      snippet_type: "model",
    },
  ]

  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
  }

  const { data } = await axios.get("/api/snippets/list_newest")

  expect(data.snippets).toHaveLength(3)
  expect(data.snippets[0].unscoped_name).toBe("Snippet3")
  expect(data.snippets[1].unscoped_name).toBe("Snippet2")
  expect(data.snippets[2].unscoped_name).toBe("Snippet1")
})
