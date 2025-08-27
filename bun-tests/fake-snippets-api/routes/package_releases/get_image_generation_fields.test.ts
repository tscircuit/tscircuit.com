import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

// ensure image generation fields are returned by /api/package_releases/get

test("POST /api/package_releases/get includes image generation fields", async () => {
  const { axios } = await getTestServer()

  const packageRes = await axios.post("/api/packages/create", {
    name: "@test/image-fields",
    description: "test package",
  })

  const { package_id } = packageRes.data.package

  const releaseRes = await axios.post("/api/package_releases/create", {
    package_id,
    version: "0.0.1",
    is_latest: true,
  })

  const { package_release } = releaseRes.data

  const res = await axios.post("/api/package_releases/get", {
    package_release_id: package_release.package_release_id,
  })

  const pr = res.data.package_release

  expect(pr.image_generation_in_progress).toBe(false)
  expect(pr.image_generation_started_at).toBeNull()
  expect(pr.image_generation_completed_at).toBeNull()
  expect(pr.image_generation_logs).toBeNull()
  expect(pr.image_generation_is_stale).toBe(false)
  expect(pr.image_generation_error).toBeNull()
  expect(pr.image_generation_error_last_updated_at).toBeNull()
  expect(pr.image_generation_display_status).toBe("pending")
})
