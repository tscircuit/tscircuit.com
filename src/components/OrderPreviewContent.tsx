import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PCBViewer } from "@tscircuit/pcb-viewer"
import { CadViewer } from "@tscircuit/3d-viewer"
import { CircuitJsonTableViewer } from "./TableViewer/CircuitJsonTableViewer"
import { AnyCircuitElement } from "circuit-json"

interface OrderPreviewContentProps {
  circuitJson: AnyCircuitElement[] | null
  className?: string
}

export const OrderPreviewContent: React.FC<OrderPreviewContentProps> = ({
  circuitJson,
  className,
}) => {
  return (
    <div className={className}>
      <Tabs defaultValue="pcb" className="w-full">
        <TabsList>
          <TabsTrigger value="pcb">PCB</TabsTrigger>
          <TabsTrigger value="cad">3D</TabsTrigger>
          <TabsTrigger value="json-table">JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="pcb">
          <div className="h-[500px] shadow overflow-hidden sm:rounded-lg mb-6">
            {circuitJson ? (
              <PCBViewer height={500} circuitJson={circuitJson} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                No PCB data available
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="cad">
          <div className="h-[500px] shadow overflow-hidden sm:rounded-lg mb-6">
            {circuitJson ? (
              <CadViewer soup={circuitJson as any} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                No 3D data available
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="json-table">
          <div className="h-[500px] shadow overflow-hidden sm:rounded-lg mb-6">
            {circuitJson ? (
              <CircuitJsonTableViewer elements={circuitJson} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                No JSON data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
