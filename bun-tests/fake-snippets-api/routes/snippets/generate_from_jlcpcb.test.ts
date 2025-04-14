import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test.skip("generate snippet from JLCPCB part number", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/snippets/generate_from_jlcpcb", {
    jlcpcb_part_number: "C46749",
  })
  expect(response.status).toBe(200)
  expect(response.data.snippet).toBeDefined()
  expect(response.data.snippet.unscoped_name).toBe("C46749")
  expect(response.data.snippet.owner_name).toBe("testuser")
  expect(response.data.snippet.snippet_type).toBe("package")
  expect(response.data.snippet.code).toContain("export const NE555P")
})
