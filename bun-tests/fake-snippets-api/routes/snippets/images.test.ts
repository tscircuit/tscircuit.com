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
      type: "board",
      compiled_js: `
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.A555Timer = void 0;
    const A555Timer = ({ name }) => /*#__PURE__*/React.createElement("chip", {
      name: name,
      footprint: "dip8"
    });
    exports.A555Timer = A555Timer;
    `.trim(),
    }),
  }
  const createdSnippet = await axios.post("/api/snippets/create", addedSnippet)

  const snippetName = addedSnippet.name.replace(
    addedSnippet.owner_name + "/",
    "",
  )

  const response = await axios.get(
    `/api/snippets/images/${createdSnippet.data.snippet.owner_name}/${createdSnippet.data.snippet.unscoped_name}/schematic.svg`,
  )

  expect(response.status).toBe(200)
  expect(response.data).toContain("<svg")
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
      type: "board",
      compiled_js: `
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.A555Timer = void 0;
    const A555Timer = ({ name }) => /*#__PURE__*/React.createElement("chip", {
      name: name,
      footprint: "dip8"
    });
    exports.A555Timer = A555Timer;
    `.trim(),
    }),
  }
  const createdSnippet = await axios.post("/api/snippets/create", addedSnippet)

  const snippetName = addedSnippet.name.replace(
    addedSnippet.owner_name + "/",
    "",
  )
  const response = await axios.get(
    `/api/snippets/images/${createdSnippet.data.snippet.owner_name}/${createdSnippet.data.snippet.unscoped_name}/pcb.svg`,
  )

  expect(response.status).toBe(200)
  expect(response.data).toContain("<svg")
})
