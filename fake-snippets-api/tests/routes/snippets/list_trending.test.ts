import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list trending snippets", async () => {
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
    }
  ]

  for (const snippet of snippets) {
    db.addSnippet(snippet as any)
  }

  const now = new Date()
  const recentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  const oldDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago

  // Add stars with different dates
  const snippet1 = db.snippets[0]
  const snippet2 = db.snippets[1]
  const snippet3 = db.snippets[2]

  // Snippet2 should be most trending (3 recent stars)
  db.addStar("user1", snippet2.snippet_id)
  db.addStar("user2", snippet2.snippet_id)
  db.addStar("user3", snippet2.snippet_id)

  // Snippet3 second (2 recent stars)
  db.addStar("user1", snippet3.snippet_id)
  db.addStar("user2", snippet3.snippet_id)

  // Snippet1 least trending (1 recent star, 1 old star)
  db.addStar("user1", snippet1.snippet_id)

  const { data } = await axios.get("/api/snippets/list_trending")

  expect(data.snippets).toHaveLength(3)
  expect(data.snippets[0].unscoped_name).toBe("Snippet2") // Most stars
  expect(data.snippets[1].unscoped_name).toBe("Snippet3") // Second most
  expect(data.snippets[2].unscoped_name).toBe("Snippet1") // Least stars
})
