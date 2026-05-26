import React from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import type { PublicOrder } from "fake-snippets-api/lib/public-mapping/public-map-order"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { KeyRound, PackageSearch } from "lucide-react"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSignIn } from "@/hooks/use-sign-in"

export const MyOrdersPage = () => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const signIn = useSignIn()

  const { data: orders, isLoading } = useQuery<PublicOrder[]>(
    ["userOrders", session?.account_id],
    async () => {
      const response = await axios.get("/orders/list", {
        params: {
          account_id: session!.account_id,
        },
      })
      return response.data.orders
    },
    {
      enabled: Boolean(session?.account_id),
    },
  )

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {!session ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="p-4 mb-4 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
              <KeyRound className="text-blue-500" size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              You're not logged in
            </h2>
            <p className="text-gray-600 mb-6 text-center max-w-md text-sm sm:text-base">
              Log in to view your orders.
            </p>
            <Button onClick={() => signIn()} variant="default">
              Log In
            </Button>
          </div>
        ) : isLoading ? (
          <div>Loading orders...</div>
        ) : orders?.length === 0 ? (
          <div className="border border-gray-200 rounded-md p-6 text-gray-600">
            You do not have any orders yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders?.map((order) => (
              <div key={order.order_id} className="border p-4 rounded-md">
                <h3 className="text-lg font-semibold">
                  Order #{order.order_id}
                </h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(order.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {order.is_running ? "Running" : "Finished"}
                </p>
                <Link href={`/orders/${order.order_id}`}>
                  <Button className="mt-2" variant="outline">
                    <PackageSearch className="mr-2 h-4 w-4" />
                    View order
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
