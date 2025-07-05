import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("create ai review", async () => {
  const { axios, seed, db } = await getTestServer()

  const response = await axios.post("/api/ai_reviews/create", {
    package_release_id: seed.packageRelease.package_release_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.ai_review.display_status).toBe("pending")
  expect(response.data.ai_review.ai_review_text).toBeNull()
  expect(response.data.ai_review.package_release_id).toBe(
    seed.packageRelease.package_release_id,
  )
  const updated = db.getPackageReleaseById(
    seed.packageRelease.package_release_id,
  )
  expect(updated?.ai_review_requested).toBe(true)
})
