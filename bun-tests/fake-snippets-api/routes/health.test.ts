import { expect, it } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

it("GET /health should return ok", async () => {
  const { axios, url } = await getTestServer()
  const res = await axios.get("/api/health")
  expect(res.status).toBe(200)
  expect(res.data).toEqual({ ok: true })
})
