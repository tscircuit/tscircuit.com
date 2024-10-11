import { useEffect, useMemo, useState } from "react"
import { CodeEditor } from "@/components/CodeEditor"
import { PCBViewer } from "@tscircuit/pcb-viewer"
import { CadViewer } from "@tscircuit/3d-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultCodeForBlankPage } from "@/lib/defaultCodeForBlankCode"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { encodeTextToUrlHash } from "@/lib/encodeTextToUrlHash"
import { Button } from "@/components/ui/button"
import { useRunTsx } from "@/hooks/use-run-tsx"
import EditorNav from "./EditorNav"
import { CircuitJsonTableViewer } from "./TableViewer/CircuitJsonTableViewer"
import { Snippet } from "fake-snippets-api/lib/db/schema"
import { useAxios } from "@/hooks/use-axios"
import { TypeBadge } from "./TypeBadge"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "react-query"
import { ClipboardIcon, Share, Eye, EyeOff, PlayIcon } from "lucide-react"
import { MagicWandIcon } from "@radix-ui/react-icons"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorTabContent } from "./ErrorTabContent"
import { cn } from "@/lib/utils"
import { useCallback } from "react"

export type PreviewContentProps =
  | {
      code: string
      triggerRunTsx: () => void
      tsxRunTriggerCount: number
      errorMessage: string | null
      circuitJson: any
      className?: string
      showCodeTab?: false
      isStreaming?: boolean
      onCodeChange?: (code: string) => void
      onDtsChange?: (dts: string) => void
    }
  | {
      code: string
      triggerRunTsx: () => void
      tsxRunTriggerCount: number
      errorMessage: string | null
      circuitJson: any
      className?: string
      showCodeTab: true
      isStreaming: boolean
      onCodeChange: (code: string) => void
      onDtsChange: (dts: string) => void
    }

const PreviewEmptyState = ({
  triggerRunTsx,
}: { triggerRunTsx: () => void }) => (
  <div className="flex items-center gap-3 bg-gray-100 text-center justify-center py-10">
    No circuit json loaded
    <Button className="bg-blue-600 hover:bg-blue-500" onClick={triggerRunTsx}>
      Run Code
      <PlayIcon className="w-3 h-3 ml-2" />
    </Button>
  </div>
)

export const PreviewContent = ({
  code,
  triggerRunTsx,
  tsxRunTriggerCount,
  errorMessage,
  circuitJson,
  showCodeTab = false,
  className,
  isStreaming,
  onCodeChange,
  onDtsChange,
}: PreviewContentProps) => {
  const [activeTab, setActiveTab] = useState(showCodeTab ? "code" : "pcb")
  const [versionOfCodeLastRun, setVersionOfCodeLastRun] = useState("")

  useEffect(() => {
    if (tsxRunTriggerCount === 0) return
    setVersionOfCodeLastRun(code)
  }, [tsxRunTriggerCount])

  useEffect(() => {
    if (errorMessage) {
      setActiveTab("error")
    }
  }, [errorMessage])

  useEffect(() => {
    if (activeTab === "code" && circuitJson && !errorMessage) {
      setActiveTab("pcb")
    }
  }, [circuitJson])

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-500"
            onClick={() => triggerRunTsx()}
            disabled={versionOfCodeLastRun === code && tsxRunTriggerCount !== 0}
          >
            Run
            <PlayIcon className="w-3 h-3 ml-2" />
          </Button>
          <div className="flex-grow" />
          <TabsList>
            {showCodeTab && <TabsTrigger value="code">Code</TabsTrigger>}
            <TabsTrigger value="pcb">
              {circuitJson && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-2 h-2 mr-1 text-xs font-bold text-white rounded-full",
                    versionOfCodeLastRun === code
                      ? "bg-blue-500"
                      : "bg-gray-500",
                  )}
                />
              )}
              PCB
            </TabsTrigger>
            <TabsTrigger value="cad">
              {circuitJson && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-2 h-2 mr-1 text-xs font-bold text-white rounded-full",
                    versionOfCodeLastRun === code
                      ? "bg-blue-500"
                      : "bg-gray-500",
                  )}
                />
              )}
              3D
            </TabsTrigger>
            <TabsTrigger value="table">JSON</TabsTrigger>
            <TabsTrigger value="error">
              Errors
              {errorMessage && (
                <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-red-500 rounded-full">
                  1
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        {showCodeTab && (
          <TabsContent value="code">
            <CodeEditor
              code={code}
              isStreaming={isStreaming}
              onCodeChange={onCodeChange!}
              onDtsChange={onDtsChange!}
              readOnly={false}
            />
          </TabsContent>
        )}
        <TabsContent value="pcb">
          <div className="mt-4 h-[500px]">
            <ErrorBoundary fallback={<div>Error loading PCB viewer</div>}>
              {circuitJson ? (
                <PCBViewer key={tsxRunTriggerCount} soup={circuitJson} />
              ) : (
                <PreviewEmptyState triggerRunTsx={triggerRunTsx} />
              )}
            </ErrorBoundary>
          </div>
        </TabsContent>
        <TabsContent value="cad">
          <div className="mt-4 h-[500px]">
            <ErrorBoundary fallback={<div>Error loading 3D viewer</div>}>
              {circuitJson ? (
                <CadViewer soup={circuitJson as any} />
              ) : (
                <PreviewEmptyState triggerRunTsx={triggerRunTsx} />
              )}
            </ErrorBoundary>
          </div>
        </TabsContent>
        <TabsContent value="table">
          <div className="mt-4 h-[500px]">
            <ErrorBoundary fallback={<div>Error loading 3D viewer</div>}>
              {circuitJson ? (
                <CircuitJsonTableViewer elements={circuitJson as any} />
              ) : (
                <PreviewEmptyState triggerRunTsx={triggerRunTsx} />
              )}
            </ErrorBoundary>
          </div>
        </TabsContent>
        <TabsContent value="error">
          {circuitJson || errorMessage ? (
            <ErrorTabContent code={code} errorMessage={errorMessage} />
          ) : (
            <PreviewEmptyState triggerRunTsx={triggerRunTsx} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
