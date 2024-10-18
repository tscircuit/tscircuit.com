import React from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Order } from "fake-snippets-api/lib/db/schema"
import { Link, useParams } from "wouter"
import { Button } from "@/components/ui/button"
import { OrderPreviewContent } from "@/components/OrderPreviewContent"
import { AnyCircuitElement } from "circuit-json"

export const ViewOrderPage = () => {
  const { orderId } = useParams()
  const axios = useAxios()

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>(
    ["order", orderId],
    async () => {
      const response = await axios.get(`/orders/get?order_id=${orderId}`)
      return response.data.order
    },
    {
      enabled: !!orderId,
    },
  )

  if (isLoading) {
    return <div>Loading order...</div>
  }

  if (error) {
    return <div>Error loading order: {(error as Error).message}</div>
  }

  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold mb-6">Order Details</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 md:max-w-[50%]">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Order #{order.order_id}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Created at: {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {order.is_shipped ? "Shipped" : "Processing"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Is Draft</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {order.is_draft ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Pending Validation
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {order.is_pending_validation_by_fab ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Approved by Fab
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {order.is_approved_by_fab_review ? "Yes" : "No"}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      In Production
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {order.is_in_production ? "Yes" : "No"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-6">
              <Link href={`/my-orders`}>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 md:max-w-[50%]">
            <OrderPreviewContent
              circuitJson={order.circuit_json as AnyCircuitElement[]}
              className="h-[calc(100vh-200px)]"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
