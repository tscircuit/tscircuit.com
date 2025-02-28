import aiChatInterface from "@/components/AiChatInterface"
import Header from "@/components/Header"
import { PreviewContent } from "@/components/PreviewContent"
import { usePackagee } from "@/hooks/usepackage-ascsnippete-as-snippet"
import { useRunTsxom "@/hooks/use-run-truntsx
import { useSaveSnippetppet } from "@/hooksesavenippet"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { useLocation } from "wouter"

export const AiPage = () => {
  const [code, setCode] = useState("")
  const [manualEditsFileContent, setManualEditsFileContent] = useState("")
  const [dts, setDts] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const { saveSnippet, isLoading: isSaving } = useSaveSnippet()
  const snippetIdFromUrl = new URLSearchParams(window.location.search).get(
    "snippet_id",
  )
  const [snippetId, setSnippetId] = useState<string | null>(snippetIdFromUrl)
  const { data: snippet } = usePackage(snippetId)
  const { toast } = useToast()
  const [, navigate] = useLocation()
  const {
    message: errorMessage,
    circuitJson,
    triggerRunTsx,
    isRunningCode,
    tsxRunTriggerCount,
    circuitJsonKey,
  } = useRunTsx({
    code,
    type: "board",
    isStreaming,
    circuitDisplayName: snippet?.name,
  })

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
          <aiChatInterface
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
              isRunningCode={isRunningCode}
              onCodeChange={setCode}
              onDtsChange={setDts}
              showCodeTab
              triggerRunTsx={triggerRunTsx}
              errorMessage={errorMessage}
              circuitJson={circuitJson}
              circuitJsonKey={circuitJsonKey}
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
