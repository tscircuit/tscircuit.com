import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { generateCircuitJson } from "bun-tests/fake-snippets-api/fixtures/get-circuit-json"

test("get schematic svg of a snippet", async () => {
  const { axios, db } = await getTestServer()

  const addedSnippet = {
    name: "testuser/my-test-board",
    unscoped_name: "my-test-board",
    owner_name: "testuser",
    code: `
  import { A555Timer } from "@tsci/seveibar.a555timer"
  
  export default () => (
    <board width="10mm" height="10mm">
      <A555Timer name="U1" />
    </board>
  )`.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "board",
    description: "A simple board with an A555 Timer component",
    circuit_json: await generateCircuitJson({
      code: `
  import { A555Timer } from "@tsci/seveibar.a555timer"
  
  export default () => (
    <board width="10mm" height="10mm">
      <A555Timer name="U1" />
    </board>
  )`.trim(),
    }),
  }

  const createdSnippet = await axios.post("/api/snippets/create", addedSnippet)

  const response = await axios.get("/api/snippets/get_image", {
    params: {
      snippetId: createdSnippet.data.snippet.snippet_id,
      image_of: "schematic",
      format: "svg",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.svg).toContain("<svg")
})

test("get pcb svg of a snippet", async () => {
  const { axios, db } = await getTestServer()

  const addedSnippet = {
    name: "testuser/my-test-board",
    unscoped_name: "my-test-board",
    owner_name: "testuser",
    code: `
  import { A555Timer } from "@tsci/seveibar.a555timer"
  
  export default () => (
    <board width="10mm" height="10mm">
      <A555Timer name="U1" />
    </board>
  )`.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "board",
    description: "A simple board with an A555 Timer component",
    circuit_json: await generateCircuitJson({
      code: `
  import { A555Timer } from "@tsci/seveibar.a555timer"
  
  export default () => (
    <board width="10mm" height="10mm">
      <A555Timer name="U1" />
    </board>
  )`.trim(),
    }),
  }

  const createdSnippet = await axios.post("/api/snippets/create", addedSnippet)

  const response = await axios.get("/api/snippets/get_image", {
    params: {
      snippetId: createdSnippet.data.snippet.snippet_id,
      image_of: "pcb",
      format: "svg",
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.svg).toContain("<svg")
})
