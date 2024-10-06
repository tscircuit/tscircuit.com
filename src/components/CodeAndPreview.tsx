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
import { ClipboardIcon, Share, Eye, EyeOff } from "lucide-react"
import { MagicWandIcon } from "@radix-ui/react-icons"
import { ErrorBoundary } from "react-error-boundary"
import { ErrorTabContent } from "./ErrorTabContent"
import { cn } from "@/lib/utils"

interface Props {
  snippet?: Snippet | null
}

export function CodeAndPreview({ snippet }: Props) {
  const axios = useAxios()
  const defaultCode = useMemo(() => {
    return decodeUrlHashToText(window.location.toString()) ?? snippet?.code
  }, [])
  const [code, setCode] = useState(defaultCode ?? "")
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    if (snippet?.code && !defaultCode) {
      setCode(snippet.code)
    }
  }, [snippet?.code])
  const { toast } = useToast()

  const { message, circuitJson } = useRunTsx(code, snippet?.snippet_type)
  const qc = useQueryClient()

  const updateSnippetMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) throw new Error("No snippet to update")
      const response = await axios.post("/snippets/update", {
        snippet_id: snippet.snippet_id,
        code: code,
      })
      if (response.status !== 200) {
        throw new Error("Failed to save snippet")
      }
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snippets", snippet?.snippet_id] })
      toast({
        title: "Snippet saved",
        description: "Your changes have been saved successfully.",
      })
    },
    onError: (error) => {
      console.error("Error saving snippet:", error)
      toast({
        title: "Error",
        description: "Failed to save the snippet. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSave = () => {
    updateSnippetMutation.mutate()
  }

  const hasUnsavedChanges = snippet?.code !== code

  if (!snippet) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col">
      <EditorNav
        snippet={snippet}
        code={code}
        isSaving={updateSnippetMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => handleSave()}
        onTogglePreview={() => setShowPreview(!showPreview)}
        previewOpen={showPreview}
      />
      <div className={`flex ${showPreview ? "flex-col md:flex-row" : ""}`}>
        <div
          className={cn(
            "hidden md:flex p-2 border-r border-gray-200 bg-gray-50",
            showPreview ? "w-full md:w-1/2" : "w-full flex",
          )}
        >
          <CodeEditor
            code={code}
            onCodeChange={(newCode) => setCode(newCode)}
          />
        </div>
        {showPreview && (
          <div className="w-full md:w-1/2 p-2 min-h-[640px]">
            <Tabs defaultValue="pcb">
              <TabsList>
                <TabsTrigger value="pcb">PCB</TabsTrigger>
                <TabsTrigger value="cad">3D</TabsTrigger>
                <TabsTrigger value="table">JSON</TabsTrigger>
                <TabsTrigger value="error">
                  Errors
                  {message && (
                    <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-red-500 rounded-full">
                      1
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pcb">
                <div className="mt-4 h-[500px]">
                  <PCBViewer soup={circuitJson} />
                </div>
              </TabsContent>
              <TabsContent value="cad">
                <div className="mt-4 h-[500px]">
                  <ErrorBoundary fallback={<div>Error loading 3D viewer</div>}>
                    <CadViewer soup={circuitJson as any} />
                  </ErrorBoundary>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="mt-4 h-[500px]">
                  <CircuitJsonTableViewer elements={circuitJson as any} />
                </div>
              </TabsContent>
              <TabsContent value="error">
                <ErrorTabContent code={code} errorMessage={message} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
