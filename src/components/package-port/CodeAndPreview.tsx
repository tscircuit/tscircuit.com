import { lazy, Suspense } from "react"
import { useConfirmDiscardChangesDialog } from "@/components/dialogs/confirm-discard-changes-dialog"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUserOnPageChange from "@/hooks/use-warn-user-on-page-change"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { cn } from "@/lib/utils"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import EditorNav from "@/components/package-port/EditorNav"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { toastManualEditConflicts } from "@/lib/utils/toastManualEditConflicts"
import { ManualEditEvent } from "@tscircuit/props"
import { useFileManagement } from "@/hooks/useFileManagement"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import { useNewPackageSavePromptDialog } from "../dialogs/new-package-save-prompt-dialog"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { getEasyEdaProxyAuthToast } from "./get-easyeda-proxy-auth-toast"
import { useEditorComponentImport } from "@/hooks/use-editor-component-import"
import { useIsMobile } from "@/components/ViewPackagePage/hooks/use-mobile"
import { useMemoryConstrainedWebKit } from "@/hooks/use-memory-constrained-webkit"
import { MobileCodeEditor } from "@/components/package-port/MobileCodeEditor"

// Desktop-only. Workers + Monaco styles are imported inside this module so they
// never enter the main-bundle heap on iOS Chrome (which OOMs at a lower
// WKWebView watermark than Safari).
const WorkspaceCodeEditor = lazy(() =>
  import("@/lib/monaco-workspace-editor").then((m) => ({
    default: m.WorkspaceCodeEditor,
  })),
)

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
  const apiBaseUrl = useApiBaseUrl()
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

  const isMobile = useIsMobile()
  const isMemoryConstrainedWebKit = useMemoryConstrainedWebKit()
  // Monaco must never load on mobile / iOS Chrome — even unmounted-but-imported
  // workers tipped CriOS over the WKWebView memory cap. Mobile "Show Code" uses
  // a textarea fallback; desktop keeps Monaco.
  const shouldRenderMonaco = !isMobile
  const shouldRenderMobileCodeEditor = isMobile && !state.showPreview
  // On iOS Chrome, defer mounting RunFrame until the user opts in. Opening the
  // editor route otherwise parses ~14MB of JS and starts eval in one shot.
  const [previewEngineEnabled, setPreviewEngineEnabled] = useState(
    () => !isMemoryConstrainedWebKit,
  )

  const filesByPath = useMemo(
    () =>
      Object.fromEntries(localFiles.map((file) => [file.path, file.content])),
    [localFiles],
  )
  const handleFileContentChange = useCallback(
    (path: string, content: string) => {
      setLocalFiles((previousFiles) =>
        previousFiles.map((file) =>
          file.path === path ? { ...file, content } : file,
        ),
      )
    },
    [setLocalFiles],
  )
  const { importComponentDialog, openImportDialog } = useEditorComponentImport({
    currentFile,
    files: filesByPath,
    updateFileContent: handleFileContentChange,
    createFile,
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

  const handleFileOperationError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  }

  useWarnUserOnPageChange({
    hasUnsavedChanges: Boolean(hasUnsavedChanges),
    isPackageThere: Boolean(pkg),
  })

  const isMouseOverRunFrame = useRef(false)
  const runFrameContainerRef = useRef<HTMLDivElement>(null)
  const sessionTokenAtRenderStartRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const isTextEntryElement = (element: Element | null) => {
      if (!(element instanceof HTMLElement)) return false
      if (element.isContentEditable) return true
      const tagName = element.tagName.toLowerCase()
      return (
        tagName === "input" || tagName === "textarea" || tagName === "select"
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMouseOverRunFrame.current) return

      const target = event.target
      if (
        target instanceof Node &&
        runFrameContainerRef.current?.contains(target)
      ) {
        return
      }

      if (
        isTextEntryElement(target instanceof Element ? target : null) ||
        isTextEntryElement(document.activeElement)
      ) {
        return
      }
      ;(document.activeElement as HTMLElement | null)?.blur()
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
        files={localFiles}
        packageFilesMeta={packageFilesMeta}
        isViewingOlderVersion={isViewingOlderVersion}
        viewingVersion={versionFromUrl}
        latestVersion={latestVersion}
        onImportComponent={openImportDialog}
      />
      <div
        className={`flex flex-1 min-h-0 ${
          state.showPreview ? "flex-col md:flex-row" : ""
        }`}
      >
        <div
          className={cn(
            "flex-col border-r border-gray-200 bg-gray-50",
            isMobile
              ? state.showPreview
                ? "hidden"
                : "flex w-full flex-1"
              : cn(
                  "hidden md:flex",
                  state.showPreview ? "w-full md:w-1/2" : "w-full flex flex-1",
                ),
          )}
        >
          {shouldRenderMonaco && (
            <Suspense fallback={null}>
              <WorkspaceCodeEditor
                files={localFiles}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
                onFileContentChange={handleFileContentChange}
                onCreateFile={(path, content) =>
                  createFile({
                    newFileName: path,
                    content,
                    onError: handleFileOperationError,
                  })
                }
                onDeleteFile={(path) =>
                  deleteFile({
                    filename: path,
                    onError: handleFileOperationError,
                  })
                }
                onRenameFile={(oldPath, newPath) =>
                  renameFile({
                    oldFilename: oldPath,
                    newFilename: newPath,
                    onError: handleFileOperationError,
                  })
                }
                isLoadingFiles={isLoading || !isFullyLoaded}
                loadingProgress={
                  totalFilesCount > 0 && loadedFilesCount < totalFilesCount
                    ? `Loading files (${loadedFilesCount}/${totalFilesCount})`
                    : null
                }
              />
            </Suspense>
          )}
          {shouldRenderMobileCodeEditor && (
            <MobileCodeEditor
              files={localFiles}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              onFileContentChange={handleFileContentChange}
            />
          )}
        </div>
        <div
          className={cn(
            "flex flex-1 min-h-0 p-0 flex-col overflow-y-hidden",
            state.fullScreen
              ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
              : "w-full md:w-1/2",
            !state.showPreview && "hidden",
          )}
          ref={runFrameContainerRef}
          onMouseEnter={() => (isMouseOverRunFrame.current = true)}
          onMouseLeave={() => (isMouseOverRunFrame.current = false)}
        >
          {state.showPreview && !previewEngineEnabled ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
              <p className="max-w-sm text-sm text-gray-600">
                Preview is loaded on demand in this browser to avoid running out
                of memory.
              </p>
              <button
                type="button"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                onClick={() => setPreviewEngineEnabled(true)}
              >
                Load preview
              </button>
            </div>
          ) : (
            <SuspenseRunFrame
              tscircuitSessionToken={sessionToken}
              showFileMenu={false}
              showRunButton
              forceLatestEvalVersion
              isLoadingFiles={isLoading || !isFullyLoaded}
              onRenderStarted={() => {
                sessionTokenAtRenderStartRef.current = sessionToken
                setState((prev) => ({ ...prev, lastRunCode: currentFileCode }))
              }}
              onRenderFinished={({ circuitJson }) => {
                const authToast = getEasyEdaProxyAuthToast({
                  circuitJson,
                  sessionToken: sessionTokenAtRenderStartRef.current,
                })
                if (authToast) toast(authToast)

                setState((prev) => ({ ...prev, circuitJson }))
                toastManualEditConflicts(circuitJson, toast)
              }}
              mainComponentPath={mainComponentPath}
              onEditEvent={(event) => {
                handleEditEvent(event)
              }}
              fsMap={fsMap}
              projectUrl={projectUrl}
              easyEdaProxyConfig={{
                proxyEndpointUrl: `${apiBaseUrl}/proxy`,
                headers: sessionToken
                  ? { Authorization: `Bearer ${sessionToken}` }
                  : undefined,
              }}
            />
          )}
        </div>
      </div>
      <NewPackageSaveDialog initialIsPrivate={false} onSave={savePackage} />
      <DiscardChangesDialog onConfirm={handleDiscardChanges} />
      {importComponentDialog}
    </div>
  )
}

export default CodeAndPreview
