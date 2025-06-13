import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list ai reviews", async () => {
  const { axios } = await getTestServer()

  await axios.post("/api/ai_reviews/create")
  await axios.post("/api/ai_reviews/create")

  const res = await axios.get("/api/ai_reviews/list")

  expect(res.status).toBe(200)
  expect(res.data.ai_reviews.length).toBe(2)
})
