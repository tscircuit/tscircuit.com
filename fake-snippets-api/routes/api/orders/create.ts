import { randomUUID } from "node:crypto"
import {
  appendOrderReturnParams,
  createFakeStripeCheckoutSession,
  getStripeCheckoutFlags,
} from "fake-snippets-api/lib/orders/stripe-checkout"
import {
  publicMapOrder,
  publicOrderSchema,
} from "fake-snippets-api/lib/public-mapping/public-map-order"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const DEFAULT_UNIT_AMOUNT_USD_CENTS = 500

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    submitted_package_release_id: z.string().optional(),
    adapted_package_release_id: z.string().optional(),
    quantity: z.number().int().min(1).max(100).default(1),
    fabricator_id: z.string().min(1).max(64).default("tsf"),
    fabricator_name: z
      .string()
      .min(1)
      .max(120)
      .default("tscircuit San Francisco"),
    success_url: z.string().url().optional(),
    cancel_url: z.string().url().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    order: publicOrderSchema,
    checkout_session: z.any(),
    stripe_checkout_session_id: z.string(),
    stripe_checkout_session_url: z.string(),
    url: z.string(),
  }),
})(async (req, ctx) => {
  const submittedPackageReleaseId =
    req.jsonBody.submitted_package_release_id ?? req.jsonBody.package_release_id

  if (!submittedPackageReleaseId) {
    return ctx.error(400, {
      error_code: "missing_package_release_id",
      message: "package_release_id is required",
    })
  }

  const packageRelease = ctx.db.getPackageReleaseById(submittedPackageReleaseId)
  if (!packageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const packageInfo = ctx.db.packages.find(
    (pkg) => pkg.package_id === packageRelease.package_id,
  )
  const packageName = packageInfo?.name ?? packageRelease.package_id
  const adaptedPackageReleaseId = req.jsonBody.adapted_package_release_id

  if (
    adaptedPackageReleaseId &&
    !ctx.db.getPackageReleaseById(adaptedPackageReleaseId)
  ) {
    return ctx.error(404, {
      error_code: "adapted_package_release_not_found",
      message: "Adapted package release not found",
    })
  }

  const orderId = randomUUID()
  const origin = new URL(req.url).origin
  const successUrl = appendOrderReturnParams({
    url: req.jsonBody.success_url ?? `${origin}/orders/success`,
    orderId,
    includeCheckoutSession: true,
  })
  const cancelUrl = appendOrderReturnParams({
    url: req.jsonBody.cancel_url ?? `${origin}/orders/cancel`,
    orderId,
    includeCheckoutSession: false,
  })

  const checkoutSession = await createFakeStripeCheckoutSession({
    requestUrl: req.url,
    orderId,
    packageName,
    packageVersion: packageRelease.version,
    quantity: req.jsonBody.quantity,
    unitAmountUsdCents: DEFAULT_UNIT_AMOUNT_USD_CENTS,
    fabricatorId: req.jsonBody.fabricator_id,
    fabricatorName: req.jsonBody.fabricator_name,
    successUrl,
    cancelUrl,
  })

  const createdOrder = ctx.db.addOrder({
    account_id: null,
    submitted_package_release_id: submittedPackageReleaseId,
    adapted_package_release_id: adaptedPackageReleaseId ?? null,
    stripe_checkout_session_id: checkoutSession.id,
    stripe_checkout_session_url: checkoutSession.url,
    ...getStripeCheckoutFlags(checkoutSession),
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
  ctx.db.updateOrder(createdOrder.order_id, { order_id: orderId })
  const order = ctx.db.getOrderById(orderId) ?? createdOrder

  return ctx.json({
    ok: true,
    order: publicMapOrder(order),
    checkout_session: checkoutSession,
    stripe_checkout_session_id: checkoutSession.id,
    stripe_checkout_session_url: checkoutSession.url,
    url: checkoutSession.url,
  })
})
