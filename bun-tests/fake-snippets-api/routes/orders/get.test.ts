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

test("get order", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  // Create a new order
  const response = await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  expect(response.status).toBe(200)
  expect(response.data.order).toBeDefined()
  expect(response.data.order.order_id).toBeDefined()
  expect(response.data.order.account_id).toBeDefined()

  const orderId = response.data.order.order_id

  // Get the created order
  const getResponse = await axios.get("/api/orders/get", {
    params: { order_id: orderId },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.order).toBeDefined()
  expect(getResponse.data.order.order_id).toBe(orderId)
  expect(getResponse.data.order.account_id).toBeDefined()

  expect(getResponse.data.orderState).toBeDefined()
  expect(getResponse.data.orderState.order_id).toBe(orderId)

  expect(getResponse.data.orderState.are_gerbers_uploaded).toBe(false)
  expect(getResponse.data.orderState.is_gerber_analyzed).toBe(false)
  expect(getResponse.data.orderState.are_initial_costs_calculated).toBe(false)
  expect(getResponse.data.orderState.is_pcb_added_to_cart).toBe(false)
  expect(getResponse.data.orderState.is_bom_uploaded).toBe(false)
  expect(getResponse.data.orderState.is_pnp_uploaded).toBe(false)
  expect(getResponse.data.orderState.is_bom_pnp_analyzed).toBe(false)
  expect(getResponse.data.orderState.is_bom_parsing_complete).toBe(false)
  expect(getResponse.data.orderState.are_components_available).toBe(false)
  expect(getResponse.data.orderState.is_patch_map_generated).toBe(false)
})

test("get order with simulate scenario", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  const createResponse = await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  expect(createResponse.status).toBe(200)
  expect(createResponse.data.order).toBeDefined()
  expect(createResponse.data.order.order_id).toBeDefined()

  const params = {
    order_id: createResponse.data.order.order_id,
    _simulate_scenario: "are_gerbers_generated",
  }

  const getResponse = await axios.get("/api/orders/get", {
    params,
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.order).toBeDefined()
  expect(getResponse.data.order.order_id).toBe(
    createResponse.data.order.order_id,
  )
  expect(getResponse.data.order.error).toBeDefined()
  expect(getResponse.data.order.error.error_code).toBe(
    "GERBER_GENERATION_FAILED",
  )
  expect(getResponse.data.order.error.message).toBe("Gerber generation failed")
})

test("get order with simulate scenario [is_bom_uploaded ]", async () => {
  const {
    axios,
    seed: { order },
  } = await getTestServer()

  const createResponse = await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  expect(createResponse.status).toBe(200)
  expect(createResponse.data.order).toBeDefined()
  expect(createResponse.data.order.order_id).toBeDefined()

  const params = {
    order_id: createResponse.data.order.order_id,
    _simulate_scenario: "is_bom_uploaded",
  }

  const getResponse = await axios.get("/api/orders/get", {
    params,
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.order).toBeDefined()
  expect(getResponse.data.order.order_id).toBe(
    createResponse.data.order.order_id,
  )
  expect(getResponse.data.orderState).toBeDefined()
  expect(getResponse.data.order.error).toBeDefined()
  expect(getResponse.data.order.error.error_code).toBe("BOM_UPLOAD_FAILED")
  expect(getResponse.data.order.error.message).toBe("Bom upload failed")

  expect(getResponse.data.orderState.are_gerbers_uploaded).toBe(true)
  expect(getResponse.data.orderState.is_gerber_analyzed).toBe(true)
  expect(getResponse.data.orderState.are_initial_costs_calculated).toBe(true)
  expect(getResponse.data.orderState.is_pcb_added_to_cart).toBe(true)

  expect(getResponse.data.orderState.is_bom_uploaded).toBe(false)

  expect(getResponse.data.orderState.is_pnp_uploaded).toBe(false)
})

test("get order after polling /move_orders_forward", async () => {
  const { axios, seed: { order } } = await getTestServer()

  const createResponse = await axios.post("/api/orders/create", {
    circuit_json: order.circuit_json,
  })

  expect(createResponse.status).toBe(200)
  expect(createResponse.data.order).toBeDefined()
  expect(createResponse.data.order.order_id).toBeDefined()

  const getResponse = await axios.get("/api/orders/get", {
    params: { order_id: createResponse.data.order.order_id },
  })

  expect(getResponse.status).toBe(200)
  expect(getResponse.data.order).toBeDefined()
  expect(getResponse.data.order.order_id).toBe(createResponse.data.order.order_id)
  expect(getResponse.data.orderState).toBeDefined()

  expect(getResponse.data.orderState.are_gerbers_uploaded).toBe(false)

  const moveOrdersForwardResponse = await axios.post(
    "/api/_fake/move_orders_forward",
    {
      order_id: createResponse.data.order.order_id,
    },
  )

  expect(moveOrdersForwardResponse.status).toBe(200)

  const getResponseAfterMove = await axios.get("/api/orders/get", {
    params: { order_id: createResponse.data.order.order_id },
  })

  expect(getResponseAfterMove.status).toBe(200)
  expect(getResponseAfterMove.data.orderState.are_gerbers_generated).toBe(true)
})