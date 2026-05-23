import React, { useState } from "react"
import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Order } from "fake-snippets-api/lib/db/schema"
import { Link, useParams } from "wouter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PcbViewerWithContainerHeight } from "@/components/PcbViewerWithContainerHeight"
import { CadViewer } from "@tscircuit/3d-viewer"
import { SchematicViewer } from "@tscircuit/schematic-viewer"
import { CircuitJsonTableViewer } from "@/components/TableViewer/CircuitJsonTableViewer"
import { AnyCircuitElement } from "circuit-json"
import {
  CheckCircle2,
  CircleDot,
  XCircle,
  Circle,
  Settings,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Play,
  Hammer,
  FileText,
} from "lucide-react"

// Define the 5 generic order steps
const orderSteps = [
  "placed",
  "paid",
  "files_ready",
  "production",
  "completed",
] as const

type OrderStep = (typeof orderSteps)[number]

const stepDetails: Record<OrderStep, { title: string; description: string }> = {
  placed: {
    title: "Order Placed",
    description: "Your order has been created and is awaiting payment.",
  },
  paid: {
    title: "Payment Received",
    description: "Stripe payment has been successfully processed.",
  },
  files_ready: {
    title: "Fabrication Files Ready",
    description: "Gerber and circuit board fabrication layouts generated.",
  },
  production: {
    title: "In Production",
    description: "PCBs are being manufactured and components placed.",
  },
  completed: {
    title: "Completed & Shipped",
    description: "Board fully assembled and shipped to your address.",
  },
}

export const ViewOrderPage = () => {
  const { orderId } = useParams()
  const axios = useAxios()
  const [simulateState, setSimulateState] = useState<string>("")

  const { data, isLoading, error } = useQuery<{
    order: Order & { error?: { error_code: string; message: string } | null }
  }>(
    ["order", orderId, simulateState],
    async () => {
      let url = `/orders/get?order_id=${orderId}`
      if (simulateState === "paid") url += "&_simulate_paid=true"
      if (simulateState === "started") url += "&_simulate_started=true"
      if (simulateState === "finished") url += "&_simulate_finished=true"
      if (simulateState === "error") url += "&_simulate_error=true"
      if (simulateState === "reset") url += "&_simulate_reset=true"

      const response = await axios.get(url)
      return response.data
    },
    {
      enabled: !!orderId,
      refetchInterval: (queryData) => {
        // Automatically poll every 2 seconds if the order is still active and has no error
        return queryData?.order?.is_running && !queryData?.order?.has_error
          ? 2000
          : false
      },
    },
  )

  const handleSimulate = (state: string) => {
    setSimulateState(state)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-slate-500 font-medium">
              Loading order details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="flex-grow flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
            <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-950 dark:text-white mb-2">
              Order Not Found
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {error instanceof Error
                ? error.message
                : "The requested order could not be loaded."}
            </p>
            <Link href="/my-orders">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Back to My Orders
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { order } = data
  const circuitJson = (order.circuit_json || []) as AnyCircuitElement[]

  // Helper to determine status of a step based on generic order flags
  const getStepStatus = (step: OrderStep) => {
    const hasError = order.has_error

    switch (step) {
      case "placed":
        return "done"

      case "paid":
        if (order.is_stripe_payment_paid) return "done"
        if (hasError) return "failed"
        return "active"

      case "files_ready":
        if (order.is_started) return "done"
        if (order.is_stripe_payment_paid) {
          if (hasError) return "failed"
          return "active"
        }
        return "pending"

      case "production":
        if (order.is_finished) return "done"
        if (order.is_started) {
          if (hasError) return "failed"
          return "active"
        }
        return "pending"

      case "completed":
        if (order.is_finished) return "done"
        if (order.is_started && !order.is_finished && !hasError) {
          return "pending"
        }
        return "pending"

      default:
        return "pending"
    }
  }

  // Calculate completed steps
  const completedStepsCount = orderSteps.filter(
    (s) => getStepStatus(s) === "done",
  ).length
  const progressPercentage = Math.round(
    (completedStepsCount / orderSteps.length) * 100,
  )

  const isFinished = order.is_finished
  const hasError = order.has_error
  const isRunning = order.is_running && !hasError

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/my-orders"
            className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors gap-2 group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </Link>
        </div>

        {/* Hero Banner / Order Overview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-10 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Order #{order.order_id}
                </h1>
                {isRunning && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 animate-pulse">
                    <CircleDot className="h-3 w-3 mr-1.5 fill-current" />
                    In Progress
                  </span>
                )}
                {hasError && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                    <XCircle className="h-3 w-3 mr-1.5" />
                    Action Required
                  </span>
                )}
                {isFinished && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Placed on {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Dev Simulation Toolbar */}
              <div className="flex items-center gap-2 border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-2.5">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 px-2">
                  <Settings className="h-3.5 w-3.5" />
                  Simulation Tools:
                </span>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    onClick={() => handleSimulate("paid")}
                    size="sm"
                    variant="outline"
                    className="h-8 border-indigo-200 text-xs hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                  >
                    Pay
                  </Button>
                  <Button
                    onClick={() => handleSimulate("started")}
                    size="sm"
                    variant="outline"
                    className="h-8 border-indigo-200 text-xs hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                  >
                    Start Production
                  </Button>
                  <Button
                    onClick={() => handleSimulate("finished")}
                    size="sm"
                    variant="outline"
                    className="h-8 border-indigo-200 text-xs hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-955/50 text-indigo-700 dark:text-indigo-300"
                  >
                    Complete
                  </Button>
                  <Button
                    onClick={() => handleSimulate("error")}
                    size="sm"
                    variant="outline"
                    className="h-8 border-indigo-200 text-xs hover:bg-rose-50 dark:border-indigo-900 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                  >
                    Fail
                  </Button>
                  <Button
                    onClick={() => handleSimulate("reset")}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>Order Tracking Status</span>
              <span>
                {completedStepsCount} of {orderSteps.length} stages (
                {progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  hasError
                    ? "bg-rose-500"
                    : isFinished
                      ? "bg-indigo-600"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {hasError && order.error && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                    Order Alert: {order.error.error_code}
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
                    {order.error.message}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline Panel - Left Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 max-h-[800px] flex flex-col">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
              <Hammer className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Order Pipeline Status
            </h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {orderSteps.map((step, idx) => {
                const status = getStepStatus(step)
                const details = stepDetails[step]

                return (
                  <div
                    key={step}
                    className={`flex items-start gap-4 p-3 rounded-2xl border transition-all ${
                      status === "active"
                        ? "border-indigo-100 bg-indigo-50/20 dark:border-indigo-900/40 dark:bg-indigo-950/10 shadow-sm"
                        : status === "failed"
                          ? "border-rose-100 bg-rose-50/10 dark:border-rose-900/30 dark:bg-rose-950/5"
                          : "border-transparent"
                    }`}
                  >
                    {/* Visual Line connector & Icon */}
                    <div className="flex flex-col items-center flex-shrink-0 mt-1">
                      <div className="relative">
                        {status === "done" && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-50/10 dark:fill-transparent" />
                        )}
                        {status === "active" && (
                          <span className="relative flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <CircleDot className="relative inline-flex h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </span>
                        )}
                        {status === "failed" && (
                          <XCircle className="h-5 w-5 text-rose-500 fill-rose-50/10 dark:fill-transparent" />
                        )}
                        {status === "pending" && (
                          <Circle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                        )}
                      </div>
                      {idx < orderSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 mt-2 ${
                            status === "done"
                              ? "bg-emerald-400 dark:bg-emerald-800"
                              : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      )}
                    </div>

                    {/* Step Text Info */}
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          status === "done"
                            ? "text-slate-900 dark:text-slate-100"
                            : status === "active"
                              ? "text-indigo-700 dark:text-indigo-400 font-extrabold"
                              : status === "failed"
                                ? "text-rose-700 dark:text-rose-400"
                                : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {details?.title || step}
                      </h4>
                      <p
                        className={`text-xs mt-0.5 leading-relaxed ${
                          status === "done" || status === "active"
                            ? "text-slate-500 dark:text-slate-400"
                            : status === "failed"
                              ? "text-rose-500 dark:text-rose-400"
                              : "text-slate-400 dark:text-slate-750"
                        }`}
                      >
                        {details?.description || ""}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Interactive Preview Panel - Right Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px]">
            <Tabs defaultValue="pcb" className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CAD & Production Preview
                </span>
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <TabsTrigger
                    value="pcb"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
                  >
                    PCB
                  </TabsTrigger>
                  <TabsTrigger
                    value="cad"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm transition-all"
                  >
                    3D View
                  </TabsTrigger>
                  <TabsTrigger
                    value="schematic"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    Schematic
                  </TabsTrigger>
                  <TabsTrigger
                    value="json"
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    JSON
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-grow relative overflow-hidden bg-slate-950/5 dark:bg-slate-950/20">
                <TabsContent value="pcb" className="m-0 h-full w-full">
                  {circuitJson && circuitJson.length > 0 ? (
                    <PcbViewerWithContainerHeight
                      circuitJson={circuitJson}
                      containerClassName="w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No PCB layout data generated yet
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cad" className="m-0 h-full w-full">
                  {circuitJson && circuitJson.length > 0 ? (
                    <div className="w-full h-full bg-slate-950">
                      <CadViewer
                        clickToInteractEnabled
                        circuitJson={circuitJson}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No 3D board rendering available
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schematic" className="m-0 h-full w-full">
                  {circuitJson && circuitJson.length > 0 ? (
                    <div className="w-full h-full bg-white dark:bg-slate-950">
                      <SchematicViewer
                        disableGroups
                        clickToInteractEnabled
                        circuitJson={circuitJson}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No schematic diagram available
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="json"
                  className="m-0 h-full w-full overflow-auto p-4 bg-white dark:bg-slate-900"
                >
                  {circuitJson && circuitJson.length > 0 ? (
                    <CircuitJsonTableViewer elements={circuitJson} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No circuit elements JSON parsed
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />

      {/* Embedded CSS custom styling */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgb(226, 232, 240);
            border-radius: 9999px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgb(51, 65, 85);
          }
        `,
        }}
      />
    </div>
  )
}

export default ViewOrderPage
