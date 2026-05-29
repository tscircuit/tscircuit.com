import { z } from "zod"
import type { Order } from "fake-snippets-api/lib/db/schema"

export const publicOrderSchema = z.object({
  order_id: z.string(),
  account_id: z.string().nullable(),
  submitted_package_release_id: z.string().nullable(),
  adapted_package_release_id: z.string().nullable(),
  stripe_checkout_session_id: z.string().nullable(),
  stripe_checkout_session_url: z.string().nullable(),
  is_stripe_checkout_session_complete: z.boolean(),
  is_stripe_checkout_session_expired: z.boolean(),
  is_stripe_checkout_session_open: z.boolean(),
  is_stripe_payment_paid: z.boolean(),
  is_running: z.boolean(),
  is_started: z.boolean(),
  is_finished: z.boolean(),
  has_error: z.boolean(),
  created_at: z.string(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
})

export type PublicOrder = z.infer<typeof publicOrderSchema>

const getPublicStripeCheckoutSessionUrl = (order: Order) => {
  if (order.is_stripe_checkout_session_expired) return null
  return order.stripe_checkout_session_url ?? null
}

export const publicMapOrder = (order: Order): PublicOrder => ({
  order_id: order.order_id,
  account_id: order.account_id,
  submitted_package_release_id: order.submitted_package_release_id ?? null,
  adapted_package_release_id: order.adapted_package_release_id ?? null,
  stripe_checkout_session_id: order.stripe_checkout_session_id ?? null,
  stripe_checkout_session_url: getPublicStripeCheckoutSessionUrl(order),
  is_stripe_checkout_session_complete:
    order.is_stripe_checkout_session_complete ?? false,
  is_stripe_checkout_session_expired:
    order.is_stripe_checkout_session_expired ?? false,
  is_stripe_checkout_session_open:
    order.is_stripe_checkout_session_open ?? false,
  is_stripe_payment_paid: order.is_stripe_payment_paid ?? false,
  is_running: order.is_running,
  is_started: order.is_started,
  is_finished: order.is_finished,
  has_error: order.has_error,
  created_at: order.created_at,
  started_at: order.started_at,
  completed_at: order.completed_at,
})
