import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create order_quote with only package_release_id (✅)", async () => {
  const { axios, jane_axios } = await getTestServer()

  const pkg = await jane_axios
    .post("/api/packages/create", {
      name: "jane/test-package",
    })
    .then((res) => res.data.package)

  const packageRelease = await jane_axios
    .post("/api/package_releases/create", {
      package_id: pkg.package_id,
      version: "1.0.0",
      is_latest: true,
    })
    .then((res) => res.data.package_release)

  await jane_axios.post(
    `/api/package_files/create`,
    {
      package_release_id: packageRelease.package_release_id,
      file_path: "/dist/index.js",
      content_text: "console.log('Hello, world!');",
    },
  )
  const response = await axios.post("/api/order_quotes/create", {
    vendor_name: "jlcpcb",
    package_release_id: packageRelease.package_release_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.order_quote_id).toBeDefined()
})
