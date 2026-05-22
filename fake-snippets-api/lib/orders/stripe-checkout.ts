import type { CheckoutSession } from "@tscircuit/fake-stripe/types"

type CheckoutSessionLike = Pick<
  CheckoutSession,
  "id" | "url" | "status" | "payment_status"
>

export const getStripeCheckoutFlags = (session: CheckoutSessionLike) => ({
  is_stripe_checkout_session_complete: session.status === "complete",
  is_stripe_checkout_session_expired: session.status === "expired",
  is_stripe_checkout_session_open: session.status === "open",
  is_stripe_payment_paid: session.payment_status === "paid",
})

export const appendOrderReturnParams = ({
  url,
  orderId,
  includeCheckoutSession,
}: {
  url: string
  orderId: string
  includeCheckoutSession: boolean
}) => {
  const parsedUrl = new URL(url)
  if (!parsedUrl.searchParams.has("order_id")) {
    parsedUrl.searchParams.set("order_id", orderId)
  }
  if (
    includeCheckoutSession &&
    !parsedUrl.href.includes("{CHECKOUT_SESSION_ID}")
  ) {
    parsedUrl.searchParams.set(
      "stripe_checkout_session_id",
      "{CHECKOUT_SESSION_ID}",
    )
  }
  return parsedUrl.toString().replace(/%7B/g, "{").replace(/%7D/g, "}")
}

const getRequestOrigin = (requestUrl: string) => new URL(requestUrl).origin

export const createFakeStripeCheckoutSession = async ({
  requestUrl,
  orderId,
  packageName,
  packageVersion,
  quantity,
  unitAmountUsdCents,
  fabricatorId,
  fabricatorName,
  successUrl,
  cancelUrl,
}: {
  requestUrl: string
  orderId: string
  packageName: string
  packageVersion: string | null
  quantity: number
  unitAmountUsdCents: number
  fabricatorId: string
  fabricatorName: string
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSession> => {
  const response = await fetch(
    `${getRequestOrigin(requestUrl)}/v1/checkout/sessions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: "payment",
        client_reference_id: orderId,
        metadata: {
          order_id: orderId,
          fabricator_id: fabricatorId,
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: unitAmountUsdCents,
              product_data: {
                name: `${packageName} PCB fabrication`,
                description: fabricatorName,
                metadata: {
                  fabricator_id: fabricatorId,
                  package_version: packageVersion ?? "",
                },
              },
            },
            quantity,
            metadata: {
              fabricator_id: fabricatorId,
            },
          },
        ],
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Fake Stripe checkout session creation failed (${response.status}): ${errorText}`,
    )
  }

  return response.json()
}

export const retrieveFakeStripeCheckoutSession = async ({
  requestUrl,
  stripeCheckoutSessionId,
}: {
  requestUrl: string
  stripeCheckoutSessionId: string
}): Promise<CheckoutSession> => {
  const response = await fetch(
    `${getRequestOrigin(requestUrl)}/v1/checkout/sessions/${encodeURIComponent(
      stripeCheckoutSessionId,
    )}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Fake Stripe checkout session retrieval failed (${response.status}): ${errorText}`,
    )
  }

  return response.json()
}
