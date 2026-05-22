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

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z
    .object({
      order_id: z.string().optional(),
      stripe_checkout_session_id: z.string().optional(),
      session_id: z.string().optional(),
    })
    .refine(
      ({ order_id, stripe_checkout_session_id, session_id }) =>
        Boolean(order_id || stripe_checkout_session_id || session_id),
      "order_id or stripe_checkout_session_id is required",
    ),
  jsonResponse: z.object({
    ok: z.boolean(),
    order: publicOrderSchema,
  }),
})(async (req, ctx) => {
  const stripeCheckoutSessionId =
    req.commonParams.stripe_checkout_session_id ?? req.commonParams.session_id
  const order = ctx.db.orders.find((candidate) => {
    if (req.commonParams.order_id) {
      return candidate.order_id === req.commonParams.order_id
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

  return ctx.json({
    ok: true,
    order: publicMapOrder(latestOrder),
  })
})
