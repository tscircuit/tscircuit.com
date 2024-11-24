import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get all snippets", async () => {
  const { axios } = await getTestServer()

  const response = await axios.get("/api/snippets/get_all")
  console.log(response.data)

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
})
