import { CodeEditor } from "@/components/package-port/CodeEditor"
import { usePackageVisibilitySettingsDialog } from "@/components/dialogs/package-visibility-settings-dialog"
import { useConfirmDiscardChangesDialog } from "@/components/dialogs/confirm-discard-changes-dialog"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUserOnPageChange from "@/hooks/use-warn-user-on-page-change"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { cn } from "@/lib/utils"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import EditorNav from "@/components/package-port/EditorNav"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { toastManualEditConflicts } from "@/lib/utils/toastManualEditConflicts"
import { ManualEditEvent } from "@tscircuit/props"
import { useFileManagement } from "@/hooks/useFileManagement"
import { DEFAULT_CODE } from "@/lib/utils/package-utils"
import { useGlobalStore } from "@/hooks/use-global-store"

interface Props {
  pkg?: Package
  /**
   * Optional project URL whose pathname will be used when
   * reporting autorouting bugs
   */
  projectUrl?: string
}

export interface CodeAndPreviewState {
  showPreview: boolean
  fullScreen: boolean
  lastSavedAt: number
  circuitJson: null | any
  isPrivate: boolean
  lastRunCode: string
  defaultComponentFile?: string
}

export function CodeAndPreview({ pkg, projectUrl }: Props) {
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)
  const urlParams = useUrlParams()

  const templateFromUrl = useMemo(
    () => (urlParams.template ? getSnippetTemplate(urlParams.template) : null),
    [urlParams.template],
  )
  const [state, setState] = useState<CodeAndPreviewState>({
    showPreview: true,
    fullScreen: false,
    lastSavedAt: Date.now(),
    circuitJson: null,
    isPrivate: false,
    lastRunCode: "",
  })

  const packageType =
    pkg?.snippet_type ?? templateFromUrl?.type ?? urlParams.snippet_type

  const { Dialog: NewPackageSaveDialog, openDialog: openNewPackageSaveDialog } =
    usePackageVisibilitySettingsDialog()

  const { Dialog: DiscardChangesDialog, openDialog: openDiscardChangesDialog } =
    useConfirmDiscardChangesDialog()

  const {
    savePackage,
    isSaving,
    currentFile,
    fsMap,
    isLoading,
    createFile,
    deleteFile,
    onFileSelect,
    saveFiles,
    setLocalFiles,
    localFiles,
    initialFiles,
  } = useFileManagement({
    templateCode: templateFromUrl?.code,
    currentPackage: pkg,
    fileChoosen: urlParams.file_path ?? null,
    openNewPackageSaveDialog,
    updateLastUpdated: () => {
      setState((prev) => ({ ...prev, lastSavedAt: Date.now() }))
    },
  })

  const hasUnsavedChanges = useMemo(
    () =>
      (!isSaving &&
        Date.now() - state.lastSavedAt > 1000 &&
        localFiles.some((file) => {
          const initialFile = initialFiles.find((x) => x.path === file.path)
          return initialFile?.content !== file.content
        })) ||
      localFiles.length !== initialFiles.length,
    [localFiles, initialFiles, isSaving, state.lastSavedAt],
  )

  useWarnUserOnPageChange({ hasUnsavedChanges })

  const currentFileCode = useMemo(
    () =>
      localFiles.find((x) => x.path === currentFile)?.content ??
      state.defaultComponentFile ??
      DEFAULT_CODE,
    [localFiles, currentFile],
  )

  const mainComponentPath = useMemo(() => {
    const isReactComponentExported =
      /export function\s+\w+/.test(currentFileCode) ||
      /export const\s+\w+\s*=/.test(currentFileCode) ||
      /export default\s+\w+/.test(currentFileCode) ||
      /export default\s+function\s*(\w*)\s*\(/.test(currentFileCode) ||
      /export default\s*\(\s*\)\s*=>/.test(currentFileCode)

    return (currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts")) &&
      !!localFiles.some((x) => x.path == currentFile) &&
      isReactComponentExported
      ? currentFile
      : state.defaultComponentFile
  }, [currentFile, localFiles, currentFileCode])

  const handleEditEvent = (event: ManualEditEvent) => {
    const parsedManualEdits = JSON.parse(
      localFiles.find((x) => x.path === "manual-edits.json")?.content || "{}",
    )
    const newManualEditsFileContent = applyEditEventsToManualEditsFile({
      circuitJson: state.circuitJson,
      editEvents: [event],
      manualEditsFile: parsedManualEdits,
    })

    setLocalFiles(
      (() => {
        const manualEditsIndex = localFiles.findIndex(
          (file) => file.path === "manual-edits.json",
        )

        const updatedFiles = [...localFiles]

        if (manualEditsIndex !== -1) {
          // Update existing manual-edits.json
          updatedFiles[manualEditsIndex] = {
            ...updatedFiles[manualEditsIndex],
            content: JSON.stringify(newManualEditsFileContent, null, 2),
          }
        } else {
          // Add new manual-edits.json
          updatedFiles.push({
            path: "manual-edits.json",
            content: JSON.stringify(newManualEditsFileContent, null, 2),
          })
        }
        return updatedFiles
      })(),
    )
  }

  const handleDiscardChanges = () => {
    setLocalFiles([...initialFiles])
    setState((prev) => ({ ...prev, lastSavedAt: Date.now() }))
    toast({
      title: "Changes discarded",
      description: "All unsaved changes have been discarded.",
    })
  }

  if (urlParams.package_id && (!pkg || isLoading)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg text-gray-500 mb-4">Loading</div>
          <Loader2 className="w-16 h-16 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[50vh]">
      <EditorNav
        circuitJson={state.circuitJson}
        pkg={pkg}
        packageType={packageType}
        code={String(currentFileCode)}
        fsMap={fsMap}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveFiles}
        onDiscard={() => openDiscardChangesDialog()}
        onTogglePreview={() =>
          setState((prev) => ({ ...prev, showPreview: !prev.showPreview }))
        }
        previewOpen={state.showPreview}
      />
      <div
        className={`flex ${state.showPreview ? "flex-col md:flex-row" : ""}`}
      >
        <div
          className={cn(
            "hidden flex-col md:flex border-r border-gray-200 bg-gray-50",
            state.showPreview ? "w-full md:w-1/2" : "w-full flex",
          )}
        >
          <CodeEditor
            isSaving={isSaving}
            handleCreateFile={createFile}
            handleDeleteFile={deleteFile}
            pkg={pkg}
            currentFile={currentFile}
            onFileSelect={onFileSelect}
            files={localFiles}
            onCodeChange={(newCode, filename) => {
              const targetFilename = filename ?? currentFile
              setLocalFiles((prev) =>
                prev.map((file) =>
                  file.path === targetFilename
                    ? { ...file, content: newCode }
                    : file,
                ),
              )
            }}
            pkgFilesLoaded={!isLoading}
          />
        </div>
        <div
          className={cn(
            "flex p-0 flex-col min-h-[640px]",
            state.fullScreen
              ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
              : "w-full md:w-1/2",
            !state.showPreview && "hidden",
          )}
        >
          <SuspenseRunFrame
            showRunButton
            forceLatestEvalVersion
            onRenderStarted={() =>
              setState((prev) => ({ ...prev, lastRunCode: currentFileCode }))
            }
            onRenderFinished={({ circuitJson }) => {
              setState((prev) => ({ ...prev, circuitJson }))
              toastManualEditConflicts(circuitJson, toast)
            }}
            mainComponentPath={mainComponentPath}
            onEditEvent={(event) => {
              handleEditEvent(event)
            }}
            fsMap={fsMap ?? {}}
            projectUrl={projectUrl}
          />
        </div>
      </div>
      <NewPackageSaveDialog initialIsPrivate={false} onSave={savePackage} />
      <DiscardChangesDialog onConfirm={handleDiscardChanges} />
    </div>
  )
}
