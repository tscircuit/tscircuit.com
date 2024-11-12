import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("get order", async () => {
  const {
    axios,
    seed: { order, account },
  } = await getTestServer()

  const orderId = order.order_id

  // Get the seeded order
  const response = await axios.get("/api/orders/get", {
    params: { order_id: orderId },
  })

  expect(response.status).toBe(200)
  expect(response.data.order).toBeDefined()
  expect(response.data.order.order_id).toBe(orderId)
  expect(response.data.order.account_id).toBe(account.account_id)
  expect(response.data.order.is_draft).toBe(true)
})

test("get non-existent order", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.get("/api/orders/get", {
      params: { order_id: "non-existent-id" },
    })

    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Order not found")
  }
})
