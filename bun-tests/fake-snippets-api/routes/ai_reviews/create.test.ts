import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create ai review", async () => {
  const { axios } = await getTestServer()

  const response = await axios.post("/api/ai_reviews/create")

  expect(response.status).toBe(200)
  expect(response.data.ai_review.display_status).toBe("pending")
  expect(response.data.ai_review.ai_review_text).toBeNull()
})
