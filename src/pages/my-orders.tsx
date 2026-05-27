import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { PublicOrder } from "fake-snippets-api/lib/public-mapping/public-map-order"
import type {
  Package,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  PackageCheck,
  PackageSearch,
} from "lucide-react"

type OrderCardData = {
  order: PublicOrder
  packageInfo?: Package
  packageRelease?: PublicPackageRelease
}

const getPaymentComplete = (order: PublicOrder) =>
  Boolean(
    order.is_stripe_payment_paid ||
      order.is_started ||
      order.is_running ||
      order.is_finished ||
      !order.stripe_checkout_session_id,
  )

const getOrderStatus = (order: PublicOrder) => {
  if (order.has_error) return "Needs attention"
  if (order.is_finished) return "Completed"
  if (order.is_running) return "In progress"
  if (getPaymentComplete(order)) return "Payment confirmed"
  return "Awaiting payment"
}

const getStatusStyle = (order: PublicOrder) => {
  if (order.has_error) return "bg-red-50 text-red-700 ring-red-200"
  if (order.is_finished) return "bg-green-50 text-green-700 ring-green-200"
  if (order.is_running) return "bg-blue-50 text-blue-700 ring-blue-200"
  if (getPaymentComplete(order))
    return "bg-emerald-50 text-emerald-700 ring-emerald-200"
  return "bg-amber-50 text-amber-700 ring-amber-200"
}

const getStatusIcon = (order: PublicOrder) => {
  if (order.has_error) return AlertTriangle
  if (order.is_finished || getPaymentComplete(order)) return CheckCircle2
  if (order.is_running) return PackageCheck
  return Clock
}

export const MyOrdersPage = () => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)

  const { data: orders, isLoading } = useQuery<OrderCardData[]>(
    ["userOrders", session?.account_id],
    async () => {
      if (!session?.account_id) return []
      const response = await axios.get("/orders/list", {
        params: { account_id: session.account_id },
      })
      const orders = response.data.orders as PublicOrder[]

      return Promise.all(
        orders.map(async (order) => {
          if (!order.submitted_package_release_id) return { order }

          try {
            const releaseResponse = await axios.post("/package_releases/get", {
              package_release_id: order.submitted_package_release_id,
            })
            const packageRelease = releaseResponse.data
              .package_release as PublicPackageRelease

            const packageResponse = await axios.get("/packages/get", {
              params: { package_id: packageRelease.package_id },
            })

            return {
              order,
              packageRelease,
              packageInfo: packageResponse.data.package as Package,
            }
          } catch {
            return { order }
          }
        }),
      )
    },
    {
      enabled: Boolean(session?.account_id),
    },
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                PCB fabrication
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-gray-950">
                My orders
              </h1>
            </div>
            {orders?.length ? (
              <div className="text-sm text-gray-500">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </div>
            ) : null}
          </div>

          {!session ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-600">
              Sign in to view your orders.
            </div>
          ) : isLoading ? (
            <div className="rounded-lg border border-gray-200 p-8 text-gray-700">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading orders...</span>
              </div>
            </div>
          ) : orders?.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-600">
              You do not have any orders yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {orders?.map(({ order, packageInfo, packageRelease }) => {
                const StatusIcon = getStatusIcon(order)
                return (
                  <div
                    key={order.order_id}
                    className="flex min-h-52 flex-col justify-between rounded-lg border border-gray-200 p-5 transition-colors hover:border-gray-300"
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase text-gray-500">
                            Board
                          </p>
                          <h2 className="mt-1 truncate text-xl font-semibold text-gray-950">
                            {packageInfo?.name ?? "PCB order"}
                          </h2>
                        </div>
                        <span
                          className={[
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                            getStatusStyle(order),
                          ].join(" ")}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {getOrderStatus(order)}
                        </span>
                      </div>

                      {packageInfo?.description ? (
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {packageInfo.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Board details are still being loaded for this order.
                        </p>
                      )}

                      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created</div>
                          <div className="mt-1 font-medium text-gray-950">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Version</div>
                          <div className="mt-1 font-mono font-medium text-gray-950">
                            {packageRelease?.version ?? "Unknown"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link href={`/orders/${order.order_id}`}>
                      <Button className="mt-5 w-full" variant="outline">
                        <PackageSearch className="mr-2 h-4 w-4" />
                        View details
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
