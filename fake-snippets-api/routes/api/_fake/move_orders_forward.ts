import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { orderSteps } from "fake-snippets-api/utils/order-steps"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "session",
  jsonResponse: z.object({
    success: z.boolean(),
  }),
})(async (req, ctx) => {
  // Get all orders that aren't finished
  const orders = ctx.db.orders.filter((order) => !order.is_finished)
  const updatedOrders = []

  for (const order of orders) {
    const orderState = ctx.db.getJlcpcbOrderStatesByOrderId(order.order_id)
    if (!orderState) continue

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
      updatedOrders.push({
        order_id: order.order_id,
        current_step: null,
      })
      continue
    }

    // Update the next step to true
    const nextStep = orderSteps[nextStepIndex]
    const updates = {
      [nextStep]: true,
      current_step: nextStep,
    }

    // If this is the last step, also update the order status
    if (nextStepIndex === orderSteps.length - 1) {
      ctx.db.updateOrder(order.order_id, {
        is_finished: true,
        completed_at: new Date().toISOString(),
      })
    }

    ctx.db.updateJlcpcbOrderState(order.order_id, updates)

    updatedOrders.push({
      order_id: order.order_id,
      current_step: nextStep,
    })
  }

  return ctx.json({
    success: true,
  })
})
