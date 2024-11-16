import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("get schematic svg of a snippet", async () => {
  const { axios, seed } = await getTestServer()

  const addedSnippet = seed.snippet

  const response = await axios.get("/api/snippets/get_image", {
    params: {
      snippetId: addedSnippet.snippet_id,
      image_of: "schematic",
      format: "svg",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.svg).toContain("<svg")
})

test("get pcb svg of a snippet", async () => {
  const { axios, seed } = await getTestServer()

  const addedSnippet = seed.snippet

  const response = await axios.get("/api/snippets/get_image", {
    params: {
      snippetId: addedSnippet.snippet_id,
      image_of: "pcb",
      format: "svg",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.svg).toContain("<svg")
})
