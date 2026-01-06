import { expect, test } from "bun:test"
import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"

test("GET /package_builds/get includes image generation fields", async () => {
  const { jane_axios, db } = await getTestServer()

  const packageRes = await jane_axios.post("/api/packages/create", {
    name: "jane/image-fields",
    description: "test package",
  })

  const { package_id } = packageRes.data.package

  const releaseRes = await jane_axios.post("/api/package_releases/create", {
    package_id,
    version: "0.0.1",
    is_latest: true,
  })

  const { package_release } = releaseRes.data

  const build = db.addPackageBuild({
    package_release_id: package_release.package_release_id,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date().toISOString(),
    transpilation_completed_at: new Date().toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date().toISOString(),
    circuit_json_build_completed_at: new Date().toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    image_generation_in_progress: false,
    image_generation_started_at: new Date().toISOString(),
    image_generation_completed_at: new Date().toISOString(),
    image_generation_logs: [],
    image_generation_error: null,
    build_in_progress: false,
    build_started_at: new Date().toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs: null,
    package_build_website_url: null,
  })

  const res = await jane_axios.get(
    `/api/package_builds/get?package_build_id=${build.package_build_id}&include_logs=true`,
  )

  const pb = res.data.package_build

  expect(pb.image_generation_in_progress).toBe(false)
  expect(pb.image_generation_started_at).toBeDefined()
  expect(pb.image_generation_completed_at).toBeDefined()
  expect(pb.image_generation_logs).toBeDefined()
  expect(pb.image_generation_error).toBeNull()
}, 10_000)
