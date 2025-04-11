import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("list orders", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  const response = await axios.get("/api/orders/list")

  expect(response.status).toBe(200)
  expect(response.data.orders).toBeDefined()
  expect(response.data.orders).toHaveLength(2)
  expect(response.data.orders[0].circuit_json).toEqual(order.circuit_json)
})

test("list orders with empty result", async () => {
  const { jane_axios } = await getTestServer()

  const response = await jane_axios.get("/api/orders/list")

  expect(response.status).toBe(200)
  expect(response.data.orders).toBeDefined()
  expect(response.data.orders).toHaveLength(0)
})
