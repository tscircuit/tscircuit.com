import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get ai review", async () => {
  const { axios } = await getTestServer()

  const createRes = await axios.post("/api/ai_reviews/create")
  const id = createRes.data.ai_review.ai_review_id

  const getRes = await axios.get("/api/ai_reviews/get", {
    params: { ai_review_id: id },
  })

  expect(getRes.status).toBe(200)
  expect(getRes.data.ai_review.ai_review_id).toBe(id)
})
