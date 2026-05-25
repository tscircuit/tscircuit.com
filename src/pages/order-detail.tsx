import { useMemo } from "react"
import { useQuery } from "react-query"
import { Link, useParams } from "wouter"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  Loader2,
  PackageCheck,
  RadioTower,
  Wrench,
} from "lucide-react"
import type { Order } from "fake-snippets-api/lib/db/schema"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"

type TrackingStep = {
  title: string
  description: string
  timestamp: string | null
  icon: typeof PackageCheck
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Pending"
  return new Date(value).toLocaleString()
}

const getPaymentComplete = (order: Order) =>
  Boolean(
    order.is_stripe_payment_paid ||
      order.is_started ||
      order.is_running ||
      order.is_finished ||
      !order.stripe_checkout_session_id,
  )

const getTrackingSteps = (order: Order): TrackingStep[] => [
  {
    title: "Order placed",
    description: "We received the PCB order and saved the submitted files.",
    timestamp: order.created_at,
    icon: PackageCheck,
  },
  {
    title: "Payment confirmed",
    description: "Checkout is complete and the order can move into production.",
    timestamp: getPaymentComplete(order) ? order.created_at : null,
    icon: CreditCard,
  },
  {
    title: "Production started",
    description: "The order is being prepared for fabrication and assembly.",
    timestamp: order.started_at,
    icon: Wrench,
  },
  {
    title: "Tracking active",
    description: "Progress is being monitored while the order runs.",
    timestamp: order.is_running || order.is_finished ? order.started_at : null,
    icon: RadioTower,
  },
  {
    title: "Order complete",
    description: "The manufacturing workflow has finished.",
    timestamp: order.completed_at,
    icon: Check,
  },
]

const getOrderComplete = (order: Order) =>
  Boolean(order.is_finished && order.completed_at)

const getCurrentStepIndex = (order: Order) => {
  if (getOrderComplete(order)) return 4
  if (order.is_running) return 3
  if (order.is_started) return 2
  if (getPaymentComplete(order)) return 1
  return 0
}

export const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const axios = useAxios()

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>(
    ["order", orderId],
    async () => {
      const response = await axios.get("/orders/get", {
        params: { order_id: orderId },
      })
      return response.data.order
    },
    {
      enabled: Boolean(orderId),
      refetchInterval: (order) =>
        order && !order.is_finished && !order.has_error ? 3000 : false,
    },
  )

  const trackingSteps = useMemo(
    () => (order ? getTrackingSteps(order) : []),
    [order],
  )
  const currentStepIndex = order ? getCurrentStepIndex(order) : 0
  const completedStepCount = trackingSteps.filter(
    (step) => step.timestamp,
  ).length
  const lastContiguousCompletedStepIndex = trackingSteps.findIndex(
    (step) => !step.timestamp,
  )
  const greenLineEndIndex =
    lastContiguousCompletedStepIndex === -1
      ? trackingSteps.length - 1
      : lastContiguousCompletedStepIndex - 1
  const greenLineWidthPercent =
    trackingSteps.length > 1 && greenLineEndIndex > 0
      ? (greenLineEndIndex / (trackingSteps.length - 1)) * 100
      : 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-6">
            <Link href="/my-orders">
              <Button variant="ghost" className="px-0 text-gray-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                My orders
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="border border-gray-200 rounded-lg p-8 flex items-center gap-3 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading order tracking...</span>
            </div>
          ) : error || !order ? (
            <div className="border border-red-200 bg-red-50 rounded-lg p-8">
              <div className="flex items-center gap-3 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                <h1 className="text-2xl font-semibold">Order not found</h1>
              </div>
              <p className="mt-3 text-red-700/80">
                We could not load tracking details for this order.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Order tracking
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold text-gray-950">
                    Order #{order.order_id}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Follow the manufacturing progress from checkout through
                    completion.
                  </p>
                </div>
                <div className="rounded-md border border-gray-200 px-4 py-3 text-sm">
                  <div className="text-gray-500">Current status</div>
                  <div className="mt-1 font-semibold text-gray-950">
                    {order.has_error
                      ? "Needs attention"
                      : getOrderComplete(order)
                        ? "Completed"
                        : order.is_running
                          ? "In progress"
                          : getPaymentComplete(order)
                            ? "Payment confirmed"
                            : "Awaiting payment"}
                  </div>
                </div>
              </div>

              {order.has_error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-5 w-5" />
                    Tracking paused
                  </div>
                  <p className="mt-2 text-sm">
                    {order.error?.message ??
                      "The order hit an error while being processed."}
                  </p>
                </div>
              ) : null}

              <div className="rounded-lg border border-gray-200 p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      Progress timeline
                    </h2>
                    <p className="text-sm text-gray-500">
                      {completedStepCount} of {trackingSteps.length} milestones
                      reached
                    </p>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500">
                    Created {formatDate(order.created_at)}
                  </div>
                </div>

                <div className="relative hidden sm:block pb-2">
                  <div className="absolute left-8 right-8 top-6 h-1 rounded-full bg-gray-200" />
                  <div
                    className="absolute left-8 top-6 h-1 rounded-full bg-green-600"
                    style={{
                      width: `calc((100% - 4rem) * ${
                        greenLineWidthPercent / 100
                      })`,
                    }}
                  />
                  <div className="relative grid grid-cols-5 gap-3">
                    {trackingSteps.map((step, index) => {
                      const Icon = step.icon
                      const isComplete = Boolean(step.timestamp)
                      const isCurrent = index === currentStepIndex
                      const isError = order.has_error && isCurrent
                      return (
                        <div key={step.title} className="min-w-0 text-center">
                          <div
                            className={[
                              "mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white",
                              isError
                                ? "border-red-500 text-red-600"
                                : isComplete
                                  ? "border-green-600 text-green-700"
                                  : "border-gray-300 text-gray-400",
                            ].join(" ")}
                          >
                            {isComplete ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="mt-3 text-sm font-medium text-gray-950">
                            {step.title}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDate(step.timestamp)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4 sm:hidden">
                  {trackingSteps.map((step, index) => {
                    const Icon = step.icon
                    const isComplete = Boolean(step.timestamp)
                    const isCurrent = index === currentStepIndex
                    const isError = order.has_error && isCurrent
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={[
                              "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white",
                              isError
                                ? "border-red-500 text-red-600"
                                : isComplete
                                  ? "border-green-600 text-green-700"
                                  : "border-gray-300 text-gray-400",
                            ].join(" ")}
                          >
                            {isComplete ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          {index < trackingSteps.length - 1 ? (
                            <div
                              className={[
                                "h-full min-h-8 w-px",
                                step.timestamp &&
                                trackingSteps[index + 1]?.timestamp
                                  ? "bg-green-600"
                                  : "bg-gray-200",
                              ].join(" ")}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 pb-2">
                          <div className="font-medium text-gray-950">
                            {step.title}
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            {step.description}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDate(step.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default OrderDetailPage
