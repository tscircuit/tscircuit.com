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
import { PreviewContent } from "./PreviewContent"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useUrlParams } from "@/hooks/use-url-params"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import "@/prettier"
import { useImportSnippetDialog } from "./dialogs/import-snippet-dialog"
import { useCreateSnippetMutation } from "@/hooks/use-create-snippet-mutation"

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
      templateFromUrl.code
    )
  }, [])
  const [code, setCode] = useState(defaultCode ?? "")
  const [dts, setDts] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const snippetType: "board" | "package" | "model" | "footprint" =
    snippet?.snippet_type ?? (templateFromUrl.type as any)

  useEffect(() => {
    if (snippet?.code) {
      setCode(snippet.code)
    }
  }, [Boolean(snippet)])

  const { toast } = useToast()

  const {
    message,
    circuitJson,
    compiledJs,
    triggerRunTsx,
    tsxRunTriggerCount,
  } = useRunTsx({
    code,
    type: snippetType,
  })
  const qc = useQueryClient()
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()

  const updateSnippetMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) throw new Error("No snippet to update")
      const response = await axios.post("/snippets/update", {
        snippet_id: snippet.snippet_id,
        code: code,
        dts: dts,
        compiled_js: compiledJs,
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

  const handleSave = () => {
    if (snippet) {
      updateSnippetMutation.mutate()
    } else {
      createSnippetMutation.mutate(code)
    }
  }

  const hasUnsavedChanges = snippet?.code !== code

  if (!snippet && urlParams.should_create_snippet) {
    return <div>Loading...</div>
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
      />
      <div className={`flex ${showPreview ? "flex-col md:flex-row" : ""}`}>
        <div
          className={cn(
            "hidden flex-col md:flex border-r border-gray-200 bg-gray-50",
            showPreview ? "w-full md:w-1/2" : "w-full flex",
          )}
        >
          <div className="flex items-center px-2 py-1 border-b border-gray-200">
            <div className="font-mono text-xs">index.tsx</div>
            <div className="flex-grow" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openImportDialog()}
            >
              Import
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.prettier && window.prettierPlugins) {
                  try {
                    const formattedCode = window.prettier.format(code, {
                      semi: false,
                      parser: "typescript",
                      plugins: window.prettierPlugins,
                    })
                    setCode(formattedCode)
                  } catch (error) {
                    toast({
                      title: "Formatting error",
                      description:
                        "Failed to format the code. Please check for syntax errors.",
                      variant: "destructive",
                    })
                  }
                }
              }}
            >
              Format
            </Button>
          </div>
          <CodeEditor
            code={code}
            onCodeChange={(newCode) => setCode(newCode)}
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
            circuitJson={circuitJson}
          />
        )}
      </div>
      <ImportSnippetDialog
        onSnippetSelected={(snippet) => {
          setCode(
            `import {} from "@tsci/${snippet.owner_name}.${snippet.unscoped_name}"\n${code}`,
          )
        }}
      />
    </div>
  )
}
