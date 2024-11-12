import { it, expect } from "bun:test"
import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"

it("GET /health should return ok", async () => {
  const { axios } = await getTestServer()
  const res = await axios.get("/api/health")
  expect(res.status).toBe(200)
  expect(res.data).toEqual({ ok: true })
})
