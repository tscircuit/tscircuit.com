import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("create order", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  const response = await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  expect(response.status).toBe(200)
  expect(response.data.order).toBeDefined()
  expect(response.data.order.circuit_json).toEqual(order.circuit_json)
})
