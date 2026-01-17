import { useConfirmDiscardChangesDialog } from "@/components/dialogs/confirm-discard-changes-dialog"
import { CodeEditor } from "@/components/package-port/CodeEditor"
import EditorNav from "@/components/package-port/EditorNav"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUserOnPageChange from "@/hooks/use-warn-user-on-page-change"
import { useFileManagement } from "@/hooks/useFileManagement"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { cn } from "@/lib/utils"
import { toastManualEditConflicts } from "@/lib/utils/toastManualEditConflicts"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { ManualEditEvent } from "@tscircuit/props"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useEffect, useMemo, useRef, useState } from "react"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import { useNewPackageSavePromptDialog } from "../dialogs/new-package-save-prompt-dialog"

interface Props {
  pkg?: Package
  /**
   * Optional project URL whose pathname will be used when
   * reporting autorouting bugs
   */
  projectUrl?: string
  isPackageFetched?: boolean
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

export function CodeAndPreview({ pkg, projectUrl, isPackageFetched }: Props) {
  const { toast } = useToast()
  const urlParams = useUrlParams()
  const sessionToken = useGlobalStore((s) => s.session?.token)
  const versionFromUrl = urlParams.version
  const templateFromUrl = useMemo(
    () => (urlParams.template ? getSnippetTemplate(urlParams.template) : null),
    [urlParams.template],
  )

  const { data: allReleases } = usePackageReleasesByPackageId(
    pkg?.package_id ?? null,
  )

  const latestVersion = useMemo(() => {
    if (!allReleases || allReleases.length === 0) return pkg?.latest_version
    const sorted = [...allReleases].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return sorted[0].version
  }, [allReleases, pkg?.latest_version])

  const releaseIdForVersion = useMemo(() => {
    if (!versionFromUrl || !allReleases) return null
    const release = allReleases.find((r) => r.version === versionFromUrl)
    return release?.package_release_id ?? null
  }, [versionFromUrl, allReleases])

  const isViewingOlderVersion = useMemo(() => {
    if (!versionFromUrl || !latestVersion) return false
    if (!releaseIdForVersion) return false
    return versionFromUrl !== latestVersion
  }, [versionFromUrl, latestVersion, releaseIdForVersion])

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
    useNewPackageSavePromptDialog()

  const { Dialog: DiscardChangesDialog, openDialog: openDiscardChangesDialog } =
    useConfirmDiscardChangesDialog()

  const {
    savePackage,
    isSaving,
    currentFile,
    fsMap,
    priorityFileFetched,
    isLoading,
    createFile,
    mainComponentPath,
    deleteFile,
    isFullyLoaded,
    onFileSelect,
    totalFilesCount,
    saveFiles,
    setLocalFiles,
    loadedFilesCount,
    localFiles,
    currentFileCode,
    initialFiles,
    renameFile,
    packageFilesMeta,
  } = useFileManagement({
    templateCode: templateFromUrl?.code,
    currentPackage: pkg,
    urlParams,
    openNewPackageSaveDialog,
    updateLastUpdated: () => {
      setState((prev) => ({ ...prev, lastSavedAt: Date.now() }))
    },
    releaseId: releaseIdForVersion,
  })

  const hasUnsavedChanges = useMemo(
    () =>
      (!isSaving &&
        Date.now() - state.lastSavedAt > 1000 &&
        localFiles.some((file) => {
          if (isHiddenFile(file.path)) return false
          const initialFile = initialFiles.find((x) => x.path === file.path)
          return initialFile?.content !== file.content
        })) ||
      localFiles.length !== initialFiles.length,
    [localFiles, initialFiles, isSaving, state.lastSavedAt],
  )

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

  useWarnUserOnPageChange({
    hasUnsavedChanges: Boolean(hasUnsavedChanges),
    isPackageThere: Boolean(pkg),
  })

  const isMouseOverRunFrame = useRef(false)

  useEffect(() => {
    const handleKeyDown = () => {
      if (isMouseOverRunFrame.current) {
        ;(document.activeElement as HTMLElement)?.blur()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <EditorNav
        circuitJson={state.circuitJson}
        pkg={pkg}
        isPackageFetched={isPackageFetched}
        packageType={packageType}
        fsMap={fsMap}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveFiles}
        onDiscard={() => openDiscardChangesDialog()}
        onTogglePreview={() =>
          setState((prev) => ({ ...prev, showPreview: !prev.showPreview }))
        }
        previewOpen={state.showPreview}
        files={localFiles}
        packageFilesMeta={packageFilesMeta}
        isViewingOlderVersion={isViewingOlderVersion}
        viewingVersion={versionFromUrl}
        latestVersion={latestVersion}
      />
      <div
        className={`flex flex-1 min-h-0 ${
          state.showPreview ? "flex-col md:flex-row" : ""
        }`}
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
            totalFilesCount={totalFilesCount}
            loadedFilesCount={loadedFilesCount}
            isFullyLoaded={isFullyLoaded}
            handleDeleteFile={deleteFile}
            handleRenameFile={renameFile}
            isPriorityFileFetched={
              !priorityFileFetched && Boolean(urlParams.package_id)
            }
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
            "flex p-0 flex-col overflow-y-hidden",
            state.fullScreen
              ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
              : "w-full md:w-1/2",
            !state.showPreview && "hidden",
          )}
          onMouseEnter={() => (isMouseOverRunFrame.current = true)}
          onMouseLeave={() => (isMouseOverRunFrame.current = false)}
        >
          <SuspenseRunFrame
            tscircuitSessionToken={sessionToken}
            showFileMenu={false}
            showRunButton
            forceLatestEvalVersion
            isLoadingFiles={isLoading || !isFullyLoaded}
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
            fsMap={fsMap}
            projectUrl={projectUrl}
          />
        </div>
      </div>
      <NewPackageSaveDialog initialIsPrivate={false} onSave={savePackage} />
      <DiscardChangesDialog onConfirm={handleDiscardChanges} />
    </div>
  )
}

export default CodeAndPreview
