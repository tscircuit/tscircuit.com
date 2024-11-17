import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("get schematic svg of a snippet", async () => {
  const { axios, seed } = await getTestServer()

  const addedSnippet = seed.snippets[0]

  const snippetName = addedSnippet.name.replace(
    addedSnippet.owner_name + "/",
    "",
  )

  const response = await axios.get(
    `/api/snippets/images/${addedSnippet.owner_name}/${snippetName}/schematic.svg`,
  )
  console.log(response.data)

  expect(response.status).toBe(200)
  expect(response.data).toContain("<svg")
})

test("get pcb svg of a snippet", async () => {
  const { axios, seed } = await getTestServer()

  const addedSnippet = seed.snippets[0]

  const snippetName = addedSnippet.name.replace(
    addedSnippet.owner_name + "/",
    "",
  )
  const response = await axios.get(
    `/api/snippets/images/${addedSnippet.owner_name}/${snippetName}/pcb.svg`,
  )

  expect(response.status).toBe(200)
  expect(response.data).toContain("<svg")
})
