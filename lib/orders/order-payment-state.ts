type OrderPaymentState = {
  stripe_checkout_session_id?: string | null
  is_stripe_checkout_session_complete?: boolean
  is_stripe_payment_paid?: boolean
  is_started?: boolean
  is_running?: boolean
  is_finished?: boolean
}

type OrderCheckoutSessionState = OrderPaymentState & {
  stripe_checkout_session_url?: string | null
  is_stripe_checkout_session_open?: boolean
  is_stripe_checkout_session_expired?: boolean
}

export const getOrderPaymentComplete = (order: OrderPaymentState) =>
  Boolean(
    order.is_stripe_checkout_session_complete ||
      order.is_stripe_payment_paid ||
      order.is_started ||
      order.is_running ||
      order.is_finished ||
      !order.stripe_checkout_session_id,
  )

export const getOrderCheckoutSessionExpired = (
  order: OrderCheckoutSessionState,
) =>
  Boolean(
    order.is_stripe_checkout_session_expired && !getOrderPaymentComplete(order),
  )

export const getOrderCanResumeCheckout = (order: OrderCheckoutSessionState) =>
  Boolean(
    order.stripe_checkout_session_url &&
      order.is_stripe_checkout_session_open &&
      !getOrderCheckoutSessionExpired(order) &&
      !getOrderPaymentComplete(order),
  )
