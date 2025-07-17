import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/useAxios"
import type { Order } from "fake-snippets-api/lib/db/schema"
import React from "react"
import { useQuery } from "react-query"
import { Link } from "wouter"

export const MyOrdersPage = () => {
  const axios = useAxios()

  const { data: orders, isLoading } = useQuery<Order[]>(
    "userOrders",
    async () => {
      const response = await axios.get("/orders/list")
      return response.data.orders
    },
  )

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        {isLoading ? (
          <div>Loading orders...</div>
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
                    View Details
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
