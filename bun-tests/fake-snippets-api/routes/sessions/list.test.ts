import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("POST /api/sessions/list validates an authenticated session", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/sessions/list", {})

  expect(response.status).toBe(200)
  expect(response.data.sessions).toBeArray()
})
