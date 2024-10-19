import AIChatInterface from "@/components/AiChatInterface"
import { CodeEditor } from "@/components/CodeEditor"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MagicWandIcon } from "@radix-ui/react-icons"
import { CadViewer } from "@tscircuit/3d-viewer"
import { PCBViewer } from "@tscircuit/pcb-viewer"
import { ArrowRight, ClipboardIcon, Save, Edit2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { ErrorTabContent } from "@/components/ErrorTabContent"
import { useLocation } from "wouter"
import { useSaveSnippet } from "@/hooks/use-save-snippet"
import { useToast } from "@/hooks/use-toast"
import { useSnippet } from "@/hooks/use-snippet"
import { PreviewContent } from "@/components/PreviewContent"
import { useGlobalStore } from "@/hooks/use-global-store"

export const AiPage = () => {
  const [code, setCode] = useState("")
  const [dts, setDts] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const {
    message: errorMessage,
    circuitJson,
    triggerRunTsx,
    tsxRunTriggerCount,
  } = useRunTsx({
    code,
    type: "board",
    isStreaming,
  })
  const { saveSnippet, isLoading: isSaving } = useSaveSnippet()
  const snippetIdFromUrl = new URLSearchParams(window.location.search).get(
    "snippet_id",
  )
  const [snippetId, setSnippetId] = useState<string | null>(snippetIdFromUrl)
  const { data: snippet } = useSnippet(snippetId)
  const { toast } = useToast()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!code && snippet && snippetIdFromUrl) {
      setCode(snippet.code)
    }
  }, [code, snippet])

  const hasUnsavedChanges = snippet?.code !== code

  return (
    <div>
      <Header />
      <div className="flex flex-col md:flex-row bg-gray-100">
        <div className="md:w-1/2">
          <AIChatInterface
            code={code}
            hasUnsavedChanges={hasUnsavedChanges}
            snippetId={snippet?.snippet_id}
            onCodeChange={setCode}
            errorMessage={errorMessage}
            onStartStreaming={() => {
              setIsStreaming(true)
            }}
            onStopStreaming={() => {
              setIsStreaming(false)
            }}
          />
        </div>
        <div className="md:w-1/2">
          <div className="p-4 h-full">
            <PreviewContent
              className="bg-white h-full p-4 rounded-lg shadow"
              code={code}
              isStreaming={isStreaming}
              onCodeChange={setCode}
              onDtsChange={setDts}
              showCodeTab
              triggerRunTsx={triggerRunTsx}
              errorMessage={errorMessage}
              circuitJson={circuitJson}
              tsxRunTriggerCount={tsxRunTriggerCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
