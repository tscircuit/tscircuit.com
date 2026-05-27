import { useMemo } from "react"
import { useQuery } from "react-query"
import { Link } from "wouter"
import { ArrowLeft, Loader2, PackageCheck, TriangleAlert } from "lucide-react"
import type { PublicOrder } from "fake-snippets-api/lib/public-mapping/public-map-order"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"
import { isUuid } from "@/lib/utils/isUuid"

export const OrderCancelPage = () => {
  const axios = useAxios()
  const params = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }, [])
  const orderId = params.get("order_id")
  const hasValidOrderId = Boolean(orderId && isUuid(orderId))

  const { data: order, isLoading } = useQuery<PublicOrder>(
    ["order", orderId],
    async () => {
      const response = await axios.get("/orders/get", {
        params: { order_id: orderId },
      })
      return response.data.order
    },
    {
      enabled: hasValidOrderId,
      refetchInterval: (order) =>
        order && order.is_stripe_checkout_session_open ? 3000 : false,
    },
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="border border-red-200 bg-red-50 rounded-lg p-8">
            <div className="flex items-center gap-3 text-red-700">
              <TriangleAlert className="h-7 w-7" />
              <h1 className="text-2xl font-semibold">Order failed</h1>
            </div>
            <div className="mt-4 space-y-3 text-gray-700">
              <p>
                Checkout was cancelled or the payment did not complete. Your
                card has not been charged.
              </p>
              {isLoading ? (
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading order details...
                </p>
              ) : order ? (
                <p className="text-sm text-gray-600">
                  Order ID:{" "}
                  <span className="font-mono text-gray-800">
                    {order.order_id}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {order ? (
                <Link href={`/orders/${order.order_id}`}>
                  <Button variant="outline">
                    <PackageCheck className="mr-2 h-4 w-4" />
                    View order
                  </Button>
                </Link>
              ) : null}
              <Link href="/my-orders">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  My orders
                </Button>
              </Link>
              <Link href="/">
                <Button>Back to home</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default OrderCancelPage
