import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test.skip("get order", async () => {
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
})

test.skip("get non-existent order", async () => {
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
