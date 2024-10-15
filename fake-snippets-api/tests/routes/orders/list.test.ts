import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
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
  expect(response.data.orders).toHaveLength(1)
  expect(response.data.orders[0].circuit_json).toEqual(order.circuit_json)
})

test("list orders with empty result", async () => {
  const { axios } = await getTestServer()

  const response = await axios.get("/api/orders/list")

  expect(response.status).toBe(200)
  expect(response.data.orders).toBeDefined()
  expect(response.data.orders).toHaveLength(0)
})
