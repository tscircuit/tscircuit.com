import { WorkspaceCodeEditor } from "@tscircuit/monaco-code-editor"
import { useConfirmDiscardChangesDialog } from "@/components/dialogs/confirm-discard-changes-dialog"
import { useEnableMonacoLanguageService } from "@/hooks/use-enable-monaco-language-service"
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import type { ImperativePanelHandle } from "react-resizable-panels"

const MIN_PANE_WIDTH = 280
const MOBILE_SPLIT_WIDTH = 768
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_SPLIT_WIDTH - 1}px)`

const CODE_EDITOR_OPTIONS = { fixedOverflowWidgets: true } as const

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

  // Off on mobile so Monaco's TypeScript worker (which OOMs mobile Safari) and
  // automatic type acquisition never start; only enabled on confirmed desktop.
  const enableMonacoLanguageService = useEnableMonacoLanguageService()

  const toastFileError = useCallback(
    (title: string) => (error: Error) => {
      toast({ title, description: error.message, variant: "destructive" })
    },
    [toast],
  )

  const handleCreateFile = useCallback(
    (path: string, content?: string) => {
      createFile({
        newFileName: path,
        content,
        onError: toastFileError("Could not create file"),
      })
    },
    [createFile, toastFileError],
  )

  const handleDeleteFile = useCallback(
    (path: string) => {
      deleteFile({
        filename: path,
        onError: toastFileError("Could not delete file"),
      })
    },
    [deleteFile, toastFileError],
  )

  const handleRenameFile = useCallback(
    (oldPath: string, newPath: string) => {
      renameFile({
        oldFilename: oldPath,
        newFilename: newPath,
        onError: toastFileError("Could not rename file"),
      })
    },
    [renameFile, toastFileError],
  )

  const handleFileContentChange = useCallback(
    (path: string, content: string) => {
      setLocalFiles((prev) =>
        prev.map((file) => (file.path === path ? { ...file, content } : file)),
      )
    },
    [setLocalFiles],
  )

  const { importComponentDialog, openImportDialog } = useEditorComponentImport({
    currentFile,
    files: fsMap,
    updateFileContent: handleFileContentChange,
    createFile,
  })

  useWarnUserOnPageChange({
    hasUnsavedChanges: Boolean(hasUnsavedChanges),
    isPackageThere: Boolean(pkg),
  })

  const isMouseOverRunFrame = useRef(false)
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const runFrameContainerRef = useRef<HTMLDivElement>(null)
  const sessionTokenAtRenderStartRef = useRef<string | undefined>(undefined)
  const editorPanelRef = useRef<ImperativePanelHandle>(null)
  const previewPanelRef = useRef<ImperativePanelHandle>(null)
  // Synchronous so the editor panel mounts at the right size, avoiding a first-paint
  // flash where it opens then collapses on mobile (as an async hook would cause).
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_MEDIA_QUERY).matches
      : false,
  )
  const defaultEditorSize = isMobile ? 0 : 50

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const [minPaneSizePercent, setMinPaneSizePercent] = useState(() =>
    typeof window !== "undefined"
      ? Math.min(40, (MIN_PANE_WIDTH / window.innerWidth) * 100)
      : 30,
  )

  // react-resizable-panels sizes in percentages, so recompute MIN_PANE_WIDTH as a
  // percentage on resize to keep the 280px minimum meaningful at every width.
  useEffect(() => {
    const container = splitContainerRef.current
    if (!container) return
    const updateMinSize = () => {
      const { width } = container.getBoundingClientRect()
      if (width <= 0) return
      const next = Math.min(40, (MIN_PANE_WIDTH / width) * 100)
      // ResizeObserver fires every frame during a window resize; bail out unless
      // the percentage moved enough to matter, so we don't re-render this heavy
      // tree (Monaco + RunFrame) on every frame.
      setMinPaneSizePercent((prev) =>
        Math.abs(prev - next) < 0.5 ? prev : next,
      )
    }
    updateMinSize()
    const observer = new ResizeObserver(updateMinSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Collapse editor panel on mobile when preview is shown so the preview fills
  // the width; expand when preview is hidden so the editor is visible.
  useEffect(() => {
    const editorPanel = editorPanelRef.current
    if (!editorPanel) return
    if (isMobile && state.showPreview) editorPanel.collapse()
    else editorPanel.expand()
  }, [isMobile, state.showPreview])

  useEffect(() => {
    const previewPanel = previewPanelRef.current
    if (!previewPanel) return
    // On mobile the editor panel is collapsed, so an expanded preview fills the
    // width; on desktop the editor effect reclaims its half.
    if (state.showPreview) previewPanel.expand()
    else previewPanel.collapse()
  }, [state.showPreview])

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
      <div className="flex flex-1 min-h-0" ref={splitContainerRef}>
        <ResizablePanelGroup direction="horizontal" className="min-h-0">
          <ResizablePanel
            ref={editorPanelRef}
            collapsible
            collapsedSize={0}
            defaultSize={defaultEditorSize}
            minSize={minPaneSizePercent}
            className="min-w-0"
          >
            <div
              className={cn(
                "h-full w-full min-w-0 flex-col bg-gray-50",
                isMobile
                  ? state.showPreview
                    ? "hidden"
                    : "flex"
                  : "hidden md:flex",
              )}
            >
              <WorkspaceCodeEditor
                files={localFiles}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
                onFileContentChange={handleFileContentChange}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                isLoadingFiles={!isFullyLoaded}
                loadingProgress={
                  isFullyLoaded
                    ? null
                    : `Loading files (${loadedFilesCount}/${totalFilesCount})`
                }
                enableTypeScriptLanguageService={enableMonacoLanguageService}
                options={CODE_EDITOR_OPTIONS}
                className="flex-1 min-h-0"
                height="100%"
              />
            </div>
          </ResizablePanel>
          <ResizableHandle
            withHandle
            aria-label="Resize code editor and preview"
            className={cn(
              "hover:bg-blue-400 data-[resize-handle-state=drag]:bg-blue-500",
              state.showPreview ? "hidden md:flex" : "hidden",
            )}
          />
          <ResizablePanel
            ref={previewPanelRef}
            collapsible
            collapsedSize={0}
            minSize={minPaneSizePercent}
            className="min-w-0"
          >
            <div
              className={cn(
                "flex h-full min-h-0 flex-col overflow-y-hidden p-0",
                state.fullScreen
                  ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
                  : "w-full min-w-0",
                !state.showPreview && "hidden",
              )}
              ref={runFrameContainerRef}
              onMouseEnter={() => (isMouseOverRunFrame.current = true)}
              onMouseLeave={() => (isMouseOverRunFrame.current = false)}
            >
              <SuspenseRunFrame
                tscircuitSessionToken={sessionToken}
                showFileMenu={false}
                showRunButton
                forceLatestEvalVersion
                isLoadingFiles={isLoading || !isFullyLoaded}
                onRenderStarted={() => {
                  sessionTokenAtRenderStartRef.current = sessionToken
                  setState((prev) => ({
                    ...prev,
                    lastRunCode: currentFileCode,
                  }))
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
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <NewPackageSaveDialog initialIsPrivate={false} onSave={savePackage} />
      <DiscardChangesDialog onConfirm={handleDiscardChanges} />
      {importComponentDialog}
    </div>
  )
}

export default CodeAndPreview
