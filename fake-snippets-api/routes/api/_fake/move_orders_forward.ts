import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { orderSteps } from "fake-snippets-api/utils/order-steps"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    order_id: z.string(),
  }),
  jsonResponse: z.object({
    success: z.boolean(),
    current_step: z.string().nullable(),
  }),
})(async (req, ctx) => {
  const { order_id } = req.jsonBody

  const orderState = ctx.db.getJlcpcbOrderStatesByOrderId(order_id)
  if (!orderState) {
    return ctx.error(404, {
      error_code: "order_state_not_found",
      message: "Order state not found",
    })
  }

  // Find the next step to complete
  let nextStepIndex = -1
  for (let i = 0; i < orderSteps.length; i++) {
    const step = orderSteps[i]
    if (!orderState[step]) {
      nextStepIndex = i
      break
    }
  }

  // If all steps are completed or no next step found
  if (nextStepIndex === -1) {
    return ctx.json({
      success: true,
      current_step: null,
    })
  }

  // Update the next step to true
  const nextStep = orderSteps[nextStepIndex]
  const updates = {
    [nextStep]: true,
    current_step: nextStep,
  }

  // If this is the last step, also update the order status
  if (nextStepIndex === orderSteps.length - 1) {
    const order = ctx.db.getOrderById(order_id)
    if (order) {
      ctx.db.updateOrder(order_id, {
        is_finished: true,
        completed_at: new Date().toISOString(),
      })
    }
  }

  ctx.db.updateJlcpcbOrderState(order_id, updates)

  return ctx.json({
    success: true,
    current_step: nextStep,
  })
})
