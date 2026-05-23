import {
  getStripeCheckoutFlags,
  retrieveFakeStripeCheckoutSession,
} from "fake-snippets-api/lib/orders/stripe-checkout"
import {
  publicMapOrder,
  publicOrderSchema,
} from "fake-snippets-api/lib/public-mapping/public-map-order"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { errorSchema } from "fake-snippets-api/lib/db/schema"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z
    .object({
      order_id: z.string().optional(),
      stripe_checkout_session_id: z.string().optional(),
      session_id: z.string().optional(),
      _simulate_paid: z.string().optional(),
      _simulate_started: z.string().optional(),
      _simulate_finished: z.string().optional(),
      _simulate_error: z.string().optional(),
      _simulate_reset: z.string().optional(),
    })
    .refine(
      ({ order_id, stripe_checkout_session_id, session_id }) =>
        Boolean(order_id || stripe_checkout_session_id || session_id),
      "order_id or stripe_checkout_session_id is required",
    ),
  jsonResponse: z.object({
    ok: z.boolean(),
    order: publicOrderSchema.extend({
      circuit_json: z.any().optional(),
      error: errorSchema.nullable().optional(),
    }),
  }),
})(async (req, ctx) => {
  const stripeCheckoutSessionId =
    req.commonParams.stripe_checkout_session_id ?? req.commonParams.session_id
  const order_id = req.commonParams.order_id

  const order = ctx.db.orders.find((candidate) => {
    if (order_id) {
      return candidate.order_id === order_id
    }
    return candidate.stripe_checkout_session_id === stripeCheckoutSessionId
  })

  if (!order) {
    return ctx.error(404, {
      error_code: "order_not_found",
      message: "Order not found",
    })
  }

  let latestOrder = order

  if (order.stripe_checkout_session_id) {
    try {
      const checkoutSession = await retrieveFakeStripeCheckoutSession({
        requestUrl: req.url,
        stripeCheckoutSessionId: order.stripe_checkout_session_id,
      })
      const updates = getStripeCheckoutFlags(checkoutSession)
      ctx.db.updateOrder(order.order_id, {
        ...updates,
        is_finished: updates.is_stripe_payment_paid || order.is_finished,
        completed_at:
          updates.is_stripe_payment_paid && !order.completed_at
            ? new Date().toISOString()
            : order.completed_at,
      })
      latestOrder = ctx.db.getOrderById(order.order_id) ?? order
    } catch (error) {
      console.warn("Failed to refresh fake Stripe checkout session state", {
        error,
        order_id: order.order_id,
      })
    }
  }

  // Handle order simulations in local development
  if (req.commonParams._simulate_paid === "true") {
    ctx.db.updateOrder(latestOrder.order_id, { is_stripe_payment_paid: true })
  }
  if (req.commonParams._simulate_started === "true") {
    ctx.db.updateOrder(latestOrder.order_id, {
      is_stripe_payment_paid: true,
      is_started: true,
    })
  }
  if (req.commonParams._simulate_finished === "true") {
    ctx.db.updateOrder(latestOrder.order_id, {
      is_stripe_payment_paid: true,
      is_started: true,
      is_finished: true,
      completed_at: new Date().toISOString(),
    })
  }
  if (req.commonParams._simulate_error === "true") {
    ctx.db.updateOrder(latestOrder.order_id, {
      has_error: true,
      error: {
        error_code: "PAYMENT_FAILED",
        message: "Stripe payment was declined by the card issuer.",
      },
    })
  }
  if (req.commonParams._simulate_reset === "true") {
    ctx.db.updateOrder(latestOrder.order_id, {
      is_stripe_payment_paid: false,
      is_started: false,
      is_finished: false,
      completed_at: null,
      has_error: false,
      error: null,
    })
  }

  latestOrder = ctx.db.getOrderById(latestOrder.order_id) ?? latestOrder

  return ctx.json({
    ok: true,
    order: {
      ...publicMapOrder(latestOrder),
      circuit_json: latestOrder.circuit_json,
      error: latestOrder.error,
    },
  })
})
