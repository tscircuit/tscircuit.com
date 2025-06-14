import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("process ai review", async () => {
  const { axios } = await getTestServer()

  const createRes = await axios.post("/api/ai_reviews/create", {})
  const id = createRes.data.ai_review.ai_review_id

  const processRes = await axios.post("/api/_fake/ai_reviews/process_review", {
    ai_review_id: id,
  })
  expect(processRes.status).toBe(200)
  expect(processRes.data.ai_review.display_status).toBe("completed")
  expect(processRes.data.ai_review.ai_review_text).toBe("Placeholder AI Review")
})
