import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create order with only circuit_json (✅)", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  const response = await axios.post("/api/order_quotes/create", {
    vendor_name: "jlcpcb",
    circuit_json: order.circuit_json,
  })

  expect(response.status).toBe(200)
  expect(response.data.order_quote_id).toBeDefined()
})

test("create order with only package_release_id (✅)", async () => {
  const {
    axios,
    seed: { packageRelease },
  } = await getTestServer()

  const response = await axios.post("/api/order_quotes/create", {
    vendor_name: "jlcpcb",
    package_release_id: packageRelease!.package_release_id,
  })

  expect(response.status).toBe(200)
  expect(response.data.order_quote_id).toBeDefined()
})

test("create order with both circuit_json and package_release_id (✅)", async () => {
  const {
    axios,
    seed: { order, packageRelease },
  } = await getTestServer()

  const response = await axios
    .post("/api/order_quotes/create", {
      vendor_name: "jlcpcb",
      circuit_json: order.circuit_json,
      package_release_id: packageRelease!.package_release_id,
    })
    .catch((error) => error) // Capture response even on error

  // Expecting backend to fail with 400
  expect(response?.status).toBe(400)
  expect(response?.data.message).toContain(
    "You must provide either circuit_json or package_release_id, but not both.",
  )
})

test("create order with neither circuit_json nor package_release_id (✅)", async () => {
  const { axios } = await getTestServer()

  const response = await axios
    .post("/api/order_quotes/create", {
      vendor_name: "jlcpcb",
    })
    .catch((error) => error) // Capture response even on error

  // Expecting backend to fail with 400
  expect(response?.status).toBe(400)
  expect(response?.data.message).toContain(
    "You must provide either circuit_json or package_release_id.",
  )
})
