import AIChatInterface from "@/components/AiChatInterface"
import Header from "@/components/Header"
import { PreviewContent } from "@/components/PreviewContent"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { useSaveSnippet } from "@/hooks/use-save-snippet"
import { useSnippet } from "@/hooks/use-snippet"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { useLocation } from "wouter"

export const AiPage = () => {
  const [code, setCode] = useState("")
  const [manualEditsFileContent, setManualEditsFileContent] = useState("")
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
      <div className="flex bg-gray-100">
        <div className="w-1/2">
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
        <div className="w-1/2">
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
              manualEditsFileContent={manualEditsFileContent}
              onManualEditsFileContentChange={(
                newManualEditsFileContent: string,
              ) => {
                setManualEditsFileContent(newManualEditsFileContent)
              }}
              tsxRunTriggerCount={tsxRunTriggerCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
