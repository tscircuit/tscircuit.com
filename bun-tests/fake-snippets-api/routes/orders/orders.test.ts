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
  const { axios, db, seed } = await getTestServer()
  const createResponse = await axios.post("/api/orders/create", {
    package_release_id: seed.packageRelease.package_release_id,
  })
  const sessionId = createResponse.data.stripe_checkout_session_id
  const orderId = createResponse.data.order.order_id

  const completeResponse = await axios.post(`/checkout/${sessionId}/complete`, {
    email: "customer@example.com",
    name: "Test Customer",
    line1: "123 Board St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94107",
    country: "US",
  })
  expect(completeResponse.status).toBe(200)

  const response = await axios.get("/api/orders/get", {
    params: { session_id: sessionId },
  })

  expect(response.status).toBe(200)
  expect(response.data.order.order_id).toBe(orderId)
  expect(response.data.order.is_stripe_checkout_session_complete).toBe(true)
  expect(response.data.order.is_stripe_payment_paid).toBe(true)
  expect(response.data.order.is_finished).toBe(false)
  expect(response.data.order.completed_at).toBeNull()

  const updatedOrder = db.getOrderById(orderId)
  expect(updatedOrder?.is_stripe_checkout_session_complete).toBe(true)
  expect(updatedOrder?.is_stripe_payment_paid).toBe(true)
  expect(updatedOrder?.is_finished).toBe(false)
  expect(updatedOrder?.completed_at).toBeNull()
})

test("GET /api/orders/list - returns orders for an account sorted by newest first", async () => {
  const { axios, db, seed } = await getTestServer()
  const accountId = "account-1234"
  const otherAccountId = "account-5678"
  const olderOrder = db.addOrder({
    account_id: accountId,
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
    created_at: new Date(Date.now() - 1000).toISOString(),
    started_at: null,
    completed_at: null,
  })
  db.addOrder({
    account_id: otherAccountId,
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
    created_at: new Date(Date.now() + 2000).toISOString(),
    started_at: null,
    completed_at: null,
  })
  const newerOrder = db.addOrder({
    account_id: accountId,
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

  const response = await axios.get("/api/orders/list", {
    params: { account_id: accountId },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.orders[0].order_id).toBe(newerOrder.order_id)
  expect(response.data.orders.map((order: any) => order.order_id)).toEqual([
    newerOrder.order_id,
    olderOrder.order_id,
  ])
})

test("GET /api/orders/list - respects limit", async () => {
  const { axios, db, seed } = await getTestServer()
  const accountId = "account-1234"
  const olderOrder = db.addOrder({
    account_id: accountId,
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
    created_at: new Date(Date.now() - 1000).toISOString(),
    started_at: null,
    completed_at: null,
  })
  const newerOrder = db.addOrder({
    account_id: accountId,
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
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
  })

  const response = await axios.get("/api/orders/list", {
    params: { account_id: accountId, limit: 1 },
  })

  expect(response.status).toBe(200)
  expect(response.data.ok).toBe(true)
  expect(response.data.orders.map((order: any) => order.order_id)).toEqual([
    newerOrder.order_id,
  ])
  expect(
    response.data.orders.map((order: any) => order.order_id),
  ).not.toContain(olderOrder.order_id)
})
