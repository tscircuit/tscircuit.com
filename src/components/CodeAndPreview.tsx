import { CodeEditor } from "@/components/CodeEditor"
import { usePackageVisibilitySettingsDialog } from "@/components/dialogs/package-visibility-settings-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useCreateSnippetMutation } from "@/hooks/use-create-snippet-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUserOnPageChange from "@/hooks/use-warn-user-on-page-change"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { cn } from "@/lib/utils"
import { parseJsonOrNull } from "@/lib/utils/parseJsonOrNull"
import type { Snippet } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import EditorNav from "./EditorNav"
import { SuspenseRunFrame } from "./SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"

interface Props {
  snippet?: Snippet | null
}

export function CodeAndPreview({ snippet }: Props) {
  const axios = useAxios()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const urlParams = useUrlParams()
  const templateFromUrl = useMemo(
    () => (urlParams.template ? getSnippetTemplate(urlParams.template) : null),
    [],
  )
  const defaultCode = useMemo(() => {
    return (
      decodeUrlHashToText(window.location.toString()) ??
      snippet?.code ??
      // If the snippet_id is in the url, use an empty string as the default
      // code until the snippet code is loaded
      (urlParams.snippet_id && "") ??
      templateFromUrl?.code
    )
  }, [])

  // Initialize with template or snippet's manual edits if available
  const [manualEditsFileContent, setManualEditsFileContent] = useState<
    string | null
  >(null)
  const [code, setCode] = useState(defaultCode ?? "")
  const [dts, setDts] = useState("")
  const [showPreview, setShowPreview] = useState(true)
  const [lastRunCode, setLastRunCode] = useState(defaultCode ?? "")
  const [fullScreen, setFullScreen] = useState(false)
  const [circuitJson, setCircuitJson] = useState<any>(null)
  const {
    Dialog: PackageVisibilitySettingsDialog,
    openDialog: openPackageVisibilitySettingsDialog,
  } = usePackageVisibilitySettingsDialog()
  const [isPrivate, setIsPrivate] = useState(false)

  const snippetType: "board" | "package" | "model" | "footprint" =
    snippet?.snippet_type ??
    (templateFromUrl?.type as any) ??
    urlParams.snippet_type

  useEffect(() => {
    if (snippet?.code) {
      setCode(snippet.code)
      setLastRunCode(snippet.code)
    }
  }, [Boolean(snippet)])

  const { toast } = useToast()

  useEffect(() => {
    if (snippet?.manual_edits_json_content) {
      setManualEditsFileContent(snippet.manual_edits_json_content ?? "")
    }
  }, [Boolean(snippet?.manual_edits_json_content)])

  const userImports = useMemo(
    () => ({
      "./manual-edits.json": parseJsonOrNull(manualEditsFileContent) ?? "",
    }),
    [manualEditsFileContent],
  )

  const qc = useQueryClient()

  const updateSnippetMutation = useMutation({
    mutationFn: async () => {
      if (!snippet) throw new Error("No snippet to update")

      const updateSnippetPayload = {
        snippet_id: snippet.snippet_id,
        code: code,
        dts: dts,
        // compiled_js: compiledJs,
        circuit_json: circuitJson,
        manual_edits_json_content: manualEditsFileContent,
      }

      try {
        const response = await axios.post(
          "/snippets/update",
          updateSnippetPayload,
        )
        return response.data
      } catch (error: any) {
        const responseStatus = error?.status ?? error?.response?.status
        // We would normally only do this if the error is a 413, but we're not
        // able to check the status properly because of the browser CORS policy
        // (the PAYLOAD_TOO_LARGE error does not have the proper CORS headers)
        if (
          import.meta.env.VITE_ALTERNATE_REGISTRY_URL &&
          (responseStatus === undefined || responseStatus === 413)
        ) {
          console.log(`Failed to update snippet, attempting alternate registry`)
          const response = await axios.post(
            `${import.meta.env.VITE_ALTERNATE_REGISTRY_URL}/snippets/update`,
            updateSnippetPayload,
          )
          return response.data
        }
        throw error
      }
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
        description:
          error instanceof Error
            ? error.message
            : "Failed to save the snippet. Please try again.",
        variant: "destructive",
      })
    },
  })

  const createSnippetMutation = useCreateSnippetMutation()
  const [lastSavedAt, setLastSavedAt] = useState(Date.now())

  const handleSave = async () => {
    if (hasUnrunChanges) {
      toast({
        title: "Warning",
        description: "You must run the snippet before saving your changes.",
        variant: "destructive",
      })
      return
    }

    if (!snippet && isLoggedIn) {
      openPackageVisibilitySettingsDialog()
      return
    }

    setLastSavedAt(Date.now())
    if (snippet) {
      updateSnippetMutation.mutate()
    } else {
      createSnippetMutation.mutate({
        code,
        circuit_json: circuitJson as any,
        manual_edits_json_content: manualEditsFileContent ?? "",
      })
    }
  }

  const hasManualEditsChanged =
    (snippet?.manual_edits_json_content ?? "") !==
    (manualEditsFileContent ?? "")

  const hasUnsavedChanges =
    !updateSnippetMutation.isLoading &&
    Date.now() - lastSavedAt > 1000 &&
    (snippet?.code !== code || hasManualEditsChanged)

  const hasUnrunChanges = code !== lastRunCode

  useWarnUserOnPageChange({ hasUnsavedChanges })

  const fsMap = useMemo(() => {
    const possibleExportNames = [
      ...(code.match(/export function (\w+)/)?.slice(1) ?? []),
      ...(code.match(/export const (\w+) ?=/)?.slice(1) ?? []),
    ]

    const exportName = possibleExportNames[0]

    let entrypointContent: string
    if (snippetType === "board") {
      entrypointContent = `
        import ${exportName ? `{ ${exportName} as Snippet }` : "Snippet"} from "./index.tsx"
        circuit.add(<Snippet />)
      `.trim()
    } else {
      entrypointContent = `
        import ${exportName ? `{ ${exportName} as Snippet }` : "Snippet"} from "./index.tsx"
        circuit.add(
          <board>
            <Snippet name="U1" />
          </board>
        )
      `.trim()
    }

    return {
      "index.tsx": code,
      "manual-edits.json": manualEditsFileContent ?? "{}",
      "main.tsx": entrypointContent,
    }
  }, [code, manualEditsFileContent])

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
            manualEditsFileContent={manualEditsFileContent ?? ""}
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
          <div
            className={cn(
              "flex p-0 flex-col min-h-[640px]",
              fullScreen
                ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
                : "w-full md:w-1/2",
            )}
          >
            <SuspenseRunFrame
              showRunButton
              forceLatestEvalVersion
              onRenderStarted={() => {
                setLastRunCode(code)
              }}
              onRenderFinished={({ circuitJson }) => {
                setCircuitJson(circuitJson)
              }}
              onEditEvent={(event) => {
                const newManualEditsFileContent =
                  applyEditEventsToManualEditsFile({
                    circuitJson: circuitJson,
                    editEvents: [event],
                    manualEditsFile: JSON.parse(manualEditsFileContent ?? "{}"),
                  })
                setManualEditsFileContent(
                  JSON.stringify(newManualEditsFileContent, null, 2),
                )
              }}
              fsMap={fsMap}
              entrypoint="main.tsx"
            />
          </div>
        )}
      </div>
      <PackageVisibilitySettingsDialog
        initialIsPrivate={false}
        onSave={(isPrivate: boolean) => {
          setLastSavedAt(Date.now())
          createSnippetMutation.mutate({
            code,
            circuit_json: circuitJson as any,
            manual_edits_json_content: manualEditsFileContent ?? "",
            is_private: isPrivate,
          })
        }}
      />
    </div>
  )
}
