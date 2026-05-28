import { useMemo } from "react"
import { Helmet } from "react-helmet-async"
import { useQuery } from "react-query"
import { Link } from "wouter"
import {
  CheckCircle2,
  Loader2,
  PackageCheck,
  TriangleAlert,
} from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"

export const OrderSuccessPage = () => {
  const axios = useAxios()
  const params = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }, [])
  const orderId = params.get("order_id")
  const stripeCheckoutSessionId =
    params.get("stripe_checkout_session_id") ?? params.get("session_id")

  const { data, isLoading, error } = useQuery(
    ["order", orderId, stripeCheckoutSessionId],
    async () => {
      const response = await axios.get("/orders/get", {
        params: {
          order_id: orderId ?? undefined,
          stripe_checkout_session_id: stripeCheckoutSessionId ?? undefined,
        },
      })
      return response.data.order
    },
    {
      enabled: Boolean(orderId || stripeCheckoutSessionId),
      refetchInterval: (order) =>
        order && !order.is_stripe_payment_paid ? 1500 : false,
    },
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>Order success - tscircuit</title>
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16">
          <div className="border border-gray-200 rounded-lg p-8">
            {isLoading ? (
              <div className="flex items-center gap-3 text-gray-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Confirming your order...</span>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-700">
                  <TriangleAlert className="h-6 w-6" />
                  <h1 className="text-2xl font-semibold">
                    We could not find this order
                  </h1>
                </div>
                <p className="text-gray-600">
                  The checkout finished, but the order details were not returned
                  with the redirect.
                </p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle2 className="h-7 w-7" />
                  <h1 className="text-2xl font-semibold">
                    Order placed successfully
                  </h1>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p>
                    Your checkout is complete and your PCB order has been
                    recorded.
                  </p>
                  <p className="text-sm text-gray-500">
                    Order ID:{" "}
                    <span className="font-mono text-gray-700">
                      {data.order_id}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/orders/${data.order_id}`}>
                    <Button>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      View order
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Back to home</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold">
                  Order details missing
                </h1>
                <p className="text-gray-600">
                  The checkout redirect did not include an order id.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default OrderSuccessPage
