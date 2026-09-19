import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"
import {
  renderStore,
  renderKey,
} from "fake-snippets-api/lib/fake-render-images"

test("fake regeneration replaces only a completed view and preserves its original board", async () => {
  const { axios, jane_axios, db } = await getTestServer()
  const {
    data: { package: pkg },
  } = await axios.post("/api/packages/create", {
    name: "testuser/render-retry",
  })
  const {
    data: { package_release: release },
  } = await axios.post("/api/package_releases/create", {
    package_id: pkg.package_id,
    version: "1.0.0",
  })
  const params = {
    package_release_id: release.package_release_id,
    angle: "top" as const,
  }
  const store = renderStore(db)
  const original = {
    ...params,
    package_release_render_image_id: "original",
    circuit_json_file_path: "dist/original/circuit.json",
    created: Date.now() - 60000,
  }
  store.set(renderKey(params), original)
  const bottom = {
    ...original,
    angle: "bottom" as const,
    package_release_render_image_id: "bottom-original",
  }
  store.set(renderKey(bottom), bottom)
  const unchanged = await axios.post(
    "/api/package_releases/create_render_image",
    { ...params, retry_failed: true },
  )
  expect(unchanged.data.render_image.package_release_render_image_id).toBe(
    "original",
  )
  const denied = await jane_axios
    .post("/api/package_releases/create_render_image", {
      ...params,
      regenerate: true,
    })
    .catch((e) => e)
  expect(denied.status).toBe(403)
  const response = await axios.post(
    "/api/package_releases/create_render_image",
    {
      ...params,
      regenerate: true,
      circuit_json_file_path: "dist/other/circuit.json",
    },
  )
  expect(response.status).toBe(202)
  const next = response.data.render_image
  expect(next.package_release_render_image_id).not.toBe("original")
  expect(next.circuit_json_file_path).toBe(original.circuit_json_file_path)
  expect(next.status).toBe("queued")
  expect(store.get(renderKey(bottom))).toEqual(bottom)
  const pending = await axios.post(
    "/api/package_releases/create_render_image",
    { ...params, regenerate: true },
  )
  expect(pending.data.render_image.package_release_render_image_id).toBe(
    next.package_release_render_image_id,
  )
})
