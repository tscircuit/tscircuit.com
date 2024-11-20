import { CodeEditor } from "@/components/CodeEditor"
import { useAxios } from "@/hooks/use-axios"
import { useCreateSnippetMutation } from "@/hooks/use-create-snippet-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUser from "@/hooks/use-warn-user"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import manualEditsTemplate from "@/lib/templates/manual-edits-template"
import { cn } from "@/lib/utils"
import "@/prettier"
import type { Snippet } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import EditorNav from "./EditorNav"
import { PreviewContent } from "./PreviewContent"
import emptyCacheTemplate from "@/lib/templates/empty-cache-template"

interface Props {
  snippet?: Snippet | null
}

export function CodeAndPreview({ snippet }: Props) {
  const axios = useAxios()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const urlParams = useUrlParams()
  const templateFromUrl = useMemo(
    () => getSnippetTemplate(urlParams.template),
    [],
  )
  const defaultCode = useMemo(() => {
    return (
      decodeUrlHashToText(window.location.toString()) ??
      snippet?.code ??
      // If the snippet_id is in the url, use an empty string as the default
      // code until the snippet code is loaded
      (urlParams.snippet_id && "") ??
      templateFromUrl.code
    )
  }, [])
  const [manualEditsFileContent, setManualEditsFileContent] = useState(
    JSON.stringify(manualEditsTemplate, null, 2) ?? "",
  )
  const [pcbRouteCacheFileContent, setPcbRouteCacheFileContent] = useState(
    JSON.stringify(emptyCacheTemplate, null, 2) ?? "",
  )
  const [code, setCode] = useState(defaultCode ?? "")
  const [dts, setDts] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const [lastRunCode, setLastRunCode] = useState(defaultCode ?? "")

  const snippetType: "board" | "package" | "model" | "footprint" =
    snippet?.snippet_type ?? (templateFromUrl.type as any)

  useEffect(() => {
    if (snippet?.code) {
      setCode(snippet.code)
      setLastRunCode(snippet.code)
    }
  }, [Boolean(snippet)])

  const { toast } = useToast()

  const userImports = useMemo(
    () => ({
      "./manual-edits.json": JSON.parse(manualEditsFileContent),
      "./pcb-route-cache.json": JSON.parse(pcbRouteCacheFileContent),
    }),
    [manualEditsFileContent, pcbRouteCacheFileContent],
  )

  const {
    message,
    circuitJson,
    compiledJs,
    triggerRunTsx,
    tsxRunTriggerCount,
    circuitJsonKey,
  } = useRunTsx({
    code,
    userImports,
    type: snippetType,
  })

  // Update lastRunCode whenever the code is run
  useEffect(() => {
    setLastRunCode(code)
  }, [tsxRunTriggerCount])

  const qc = useQueryClient()

  const updateSnippetMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) throw new Error("No snippet to update")
      const response = await axios.post("/snippets/update", {
        snippet_id: snippet.snippet_id,
        code: code,
        dts: dts,
        compiled_js: compiledJs,
        circuit_json: circuitJson,
        pcb_route_cache: pcbRouteCacheFileContent,
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

  const createSnippetMutation = useCreateSnippetMutation()

  const handleSave = async () => {
    if (snippet) {
      updateSnippetMutation.mutate()
    } else {
      createSnippetMutation.mutate({
        code,
        circuit_json: circuitJson as any,
        pcb_route_cache: pcbRouteCacheFileContent,
      })
    }
  }

  const hasUnsavedChanges = snippet?.code !== code
  const hasUnrunChanges = code !== lastRunCode
  useWarnUser({ hasUnsavedChanges })

  if (!snippet && (urlParams.snippet_id || urlParams.should_create_snippet)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg text-gray-500 mb-4">Loading</div>
          <Loader2 className="w-16 h-16 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <EditorNav
        circuitJson={circuitJson}
        snippet={snippet}
        snippetType={snippetType}
        code={code}
        isSaving={updateSnippetMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => handleSave()}
        onTogglePreview={() => setShowPreview(!showPreview)}
        previewOpen={showPreview}
        canSave={!hasUnrunChanges} // Disable save if there are unrun changes
      />
      <div className={`flex ${showPreview ? "flex-col md:flex-row" : ""}`}>
        <div
          className={cn(
            "hidden flex-col md:flex border-r border-gray-200 bg-gray-50",
            showPreview ? "w-full md:w-1/2" : "w-full flex",
          )}
        >
          <CodeEditor
            initialCode={code}
            manualEditsFileContent={manualEditsFileContent}
            onManualEditsFileContentChanged={(newContent) => {
              setManualEditsFileContent(newContent)
            }}
            onCodeChange={(newCode) => {
              setCode(newCode)
            }}
            onDtsChange={(newDts) => setDts(newDts)}
          />
        </div>
        {showPreview && (
          <PreviewContent
            className="w-full md:w-1/2 p-2 min-h-[640px]"
            code={code}
            triggerRunTsx={triggerRunTsx}
            tsxRunTriggerCount={tsxRunTriggerCount}
            errorMessage={message}
            circuitJsonKey={circuitJsonKey}
            circuitJson={circuitJson}
            manualEditsFileContent={manualEditsFileContent}
            onManualEditsFileContentChange={(newManualEditsFileContent) => {
              setManualEditsFileContent(newManualEditsFileContent)
            }}
          />
        )}
      </div>
    </div>
  )
}
