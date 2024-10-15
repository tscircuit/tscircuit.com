import { getTestServer } from "fake-snippets-api/tests/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("update order", async () => {
  const {
    axios,
    seed: {
      order: { order_id },
    },
  } = await getTestServer()

  const response = await axios.patch("/api/orders/update", {
    order_id,
    updates: {
      is_draft: false,
      is_pending_validation_by_fab: true,
      jlcpcb_order_params: { param1: "value1" },
    },
  })

  expect(response.status).toBe(200)
  expect(response.data.order).toBeDefined()
  expect(response.data.order.order_id).toBe(order_id)
  expect(response.data.order.is_draft).toBe(false)
  expect(response.data.order.is_pending_validation_by_fab).toBe(true)
  expect(response.data.order.jlcpcb_order_params).toEqual({ param1: "value1" })
})

test("update non-existent order", async () => {
  const { axios } = await getTestServer()

  try {
    await axios.patch("/api/orders/update", {
      order_id: "non-existent-id",
      updates: {
        is_draft: false,
      },
    })

    // If the request doesn't throw an error, fail the test
    expect(true).toBe(false)
  } catch (error: any) {
    expect(error.status).toBe(404)
    expect(error.data.error.message).toBe("Order not found")
  }
})
