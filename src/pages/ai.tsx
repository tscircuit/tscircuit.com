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

export const AiPage = () => {
  const [code, setCode] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const { message: errorMessage, circuitJson } = useRunTsx(code, "board", {
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
            <div className="bg-white h-full p-4 rounded-lg shadow">
              <Tabs defaultValue="code">
                <div className="flex items-center gap-2">
                  <TabsList>
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="pcb">PCB</TabsTrigger>
                    <TabsTrigger value="3d">3D</TabsTrigger>
                    <TabsTrigger value="error">
                      Errors
                      {errorMessage && (
                        <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-red-500 rounded-full">
                          1
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-grow" />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (snippetId) {
                          // TODO update snippet
                        }

                        try {
                          const snippet = await saveSnippet(code, "board")
                          navigate(`/ai?snippet_id=${snippet.snippet_id}`)
                          toast({
                            title: "Snippet saved",
                            description:
                              "Your snippet has been saved successfully.",
                          })
                          setSnippetId(snippet.snippet_id)
                        } catch (error) {
                          toast({
                            title: "Error",
                            description:
                              "Failed to save the snippet. Please try again.",
                            variant: "destructive",
                          })
                        }
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Snippet"}
                      <Save className="w-3 h-3 ml-2 opacity-60" />
                    </Button>
                  </div>
                </div>
                <TabsContent value="code">
                  <div className="mt-4 bg-gray-50 rounded-md border border-gray-200">
                    <CodeEditor
                      code={code}
                      onCodeChange={setCode}
                      readOnly={false}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="pcb">
                  <div className="mt-4 h-[500px]">
                    {circuitJson ? (
                      <PCBViewer soup={circuitJson} />
                    ) : (
                      "No Circuit JSON (might be an error in the snippet)"
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="3d">
                  <div className="mt-4 h-[500px]">
                    {circuitJson ? (
                      <CadViewer soup={circuitJson as any} />
                    ) : (
                      "No Circuit JSON (might be an error in the snippet)"
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="error">
                  <ErrorTabContent code={code} errorMessage={errorMessage} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
