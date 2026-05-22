import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { expect, test } from "bun:test"

test("POST /api/orders/create - creates an order with a fake Stripe checkout session", async () => {
  const { axios, db, seed } = await getTestServer()

  const response = await axios.post("/api/orders/create", {
    package_release_id: seed.packageRelease.package_release_id,
    quantity: 2,
    fabricator_id: "jlcpcb",
    fabricator_name: "JLCPCB",
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.stripe_checkout_session_id).toStartWith("cs_test_")
  expect(response.data.stripe_checkout_session_url).toContain(
    `/checkout/${response.data.stripe_checkout_session_id}`,
  )
  expect(response.data.url).toBe(response.data.stripe_checkout_session_url)
  expect(response.data.checkout_session.line_items[0].quantity).toBe(2)
  expect(response.data.checkout_session.metadata.fabricator_id).toBe("jlcpcb")
  expect(response.data.order.submitted_package_release_id).toBe(
    seed.packageRelease.package_release_id,
  )
  expect(response.data.order.stripe_checkout_session_id).toBe(
    response.data.stripe_checkout_session_id,
  )
  expect(response.data.order.is_stripe_checkout_session_open).toBe(true)
  expect(response.data.order.is_finished).toBe(false)

  const order = db.getOrderById(response.data.order.order_id)
  expect(order).toBeDefined()
  expect(order?.stripe_checkout_session_id).toBe(
    response.data.stripe_checkout_session_id,
  )
})

test("GET /api/orders/get - returns an order by order_id", async () => {
  const { axios, seed } = await getTestServer()

  const response = await axios.get("/api/orders/get", {
    params: { order_id: seed.order.order_id },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.order.order_id).toBe(seed.order.order_id)
  expect(response.data.order.account_id).toBe(seed.account.account_id)
})

test("GET /api/orders/get - refreshes Stripe checkout state when looking up by session_id", async () => {
  const { axios, db, fakeStripe, seed } = await getTestServer()
  const createResponse = await axios.post("/api/orders/create", {
    package_release_id: seed.packageRelease.package_release_id,
  })
  const sessionId = createResponse.data.stripe_checkout_session_id
  const orderId = createResponse.data.order.order_id

  fakeStripe.completeCheckoutSession(sessionId, {
    customer_details: {
      email: "customer@example.com",
      name: "Test Customer",
      address: {
        line1: "123 Board St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94107",
        country: "US",
      },
    },
    shipping_details: {
      name: "Test Customer",
      address: {
        line1: "123 Board St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94107",
        country: "US",
      },
    },
  })

  const response = await axios.get("/api/orders/get", {
    params: { session_id: sessionId },
  })

  expect(response.status).toBe(200)
  expect(response.data.order.order_id).toBe(orderId)
  expect(response.data.order.is_stripe_checkout_session_complete).toBe(true)
  expect(response.data.order.is_stripe_payment_paid).toBe(true)
  expect(response.data.order.is_finished).toBe(true)
  expect(response.data.order.completed_at).not.toBeNull()

  const updatedOrder = db.getOrderById(orderId)
  expect(updatedOrder?.is_finished).toBe(true)
  expect(updatedOrder?.completed_at).not.toBeNull()
})

test("GET /api/orders/list - returns orders sorted by newest first", async () => {
  const { axios, db, seed } = await getTestServer()
  const olderOrder = seed.order
  const newerOrder = db.addOrder({
    account_id: seed.account.account_id,
    submitted_package_release_id: seed.packageRelease.package_release_id,
    adapted_package_release_id: null,
    stripe_checkout_session_id: null,
    stripe_checkout_session_url: null,
    is_running: false,
    is_started: false,
    is_finished: false,
    error: null,
    has_error: false,
    circuit_json: null,
    created_at: new Date(Date.now() + 1000).toISOString(),
    started_at: null,
    completed_at: null,
  })

  const response = await axios.get("/api/orders/list")

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.orders[0].order_id).toBe(newerOrder.order_id)
  expect(response.data.orders.map((order: any) => order.order_id)).toContain(
    olderOrder.order_id,
  )
})
