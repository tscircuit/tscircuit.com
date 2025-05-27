import { CodeEditor } from "@/components/package-port/CodeEditor"
import { usePackageVisibilitySettingsDialog } from "@/components/dialogs/package-visibility-settings-dialog"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useToast } from "@/hooks/use-toast"
import { useUrlParams } from "@/hooks/use-url-params"
import useWarnUserOnPageChange from "@/hooks/use-warn-user-on-page-change"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { getSnippetTemplate } from "@/lib/get-snippet-template"
import { cn } from "@/lib/utils"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import EditorNav from "@/components/package-port/EditorNav"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useUpdatePackageFilesMutation } from "@/hooks/useUpdatePackageFilesMutation"
import { usePackageFilesLoader } from "@/hooks/usePackageFilesLoader"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import { toastManualEditConflicts } from "@/lib/utils/toastManualEditConflicts"
import { ManualEditEvent } from "@tscircuit/props"
import { useFileManagement } from "@/hooks/useFileManagement"
import { FileName } from "./CodeEditorHeader"

interface Props {
  pkg?: Package
}

export interface PackageFile {
  path: string
  content: string
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

export const DEFAULT_CODE = `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)
`.trim()

export const generateRandomPackageName = () =>
  `untitled-package-${Math.floor(Math.random() * 90) + 10}`

export function CodeAndPreview({ pkg }: Props) {
  const { toast } = useToast()
  const loggedInUser = useGlobalStore((s) => s.session)
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

  const { currentFile, fsMap, isLoading, createFile, deleteFile, onFileSelect, saveFiles, setLocalFiles, localFiles, initialFiles } =
    useFileManagement({
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
        })
      },
      templateCode: templateFromUrl?.code,
      currentPackage: pkg,
    })

  const createPackageMutation = useCreatePackageMutation()
  const { mutate: createRelease } = useCreatePackageReleaseMutation({
    onSuccess: () => {
      toast({
        title: "Package released",
        description: "Your package has been released successfully.",
      })
    },
  })

  const axios = useAxios()

  const updatePackageFilesMutation = useUpdatePackageFilesMutation({
    pkg,
    pkgFilesWithContent: localFiles,
    initiallyLoadedFiles: initialFiles,
    pkgFiles :{data: localFiles},
    axios,
    toast,
  })

  const hasUnsavedChanges = useMemo(
    () =>
      (!updatePackageFilesMutation.isLoading &&
        Date.now() - state.lastSavedAt > 1000 &&
        localFiles.some((file) => {
          const initialFile = initialFiles.find(
            (x) => x.path === file.path,
          )
          return initialFile?.content !== file.content
        })) ||
        localFiles.length !== initialFiles.length,
    [
      localFiles,
      initialFiles,
      updatePackageFilesMutation.isLoading,
      state.lastSavedAt,
    ],
  )

  useWarnUserOnPageChange({ hasUnsavedChanges })

  const handleNewPackageSaveRequest = async (isPrivate: boolean) => {
    setState((prev) => ({ ...prev, lastSavedAt: Date.now() }))
    const newPackage = await createPackageMutation.mutateAsync({
      name: `${loggedInUser?.github_username}/${generateRandomPackageName()}`,
      is_private: isPrivate,
    })

    if (newPackage) {
      createRelease(
        {
          package_name_with_version: `${newPackage.name}@latest`,
        },
        {
          onSuccess: () => {
            updatePackageFilesMutation.mutate({
              package_name_with_version: `${newPackage.name}@latest`,
              ...newPackage,
            })
          },
        },
      )
    }
  }

  const currentFileCode = useMemo(
    () =>
      localFiles.find((x) => x.path === currentFile)
        ?.content ??
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

    return (currentFile?.endsWith(".tsx") ||
      currentFile?.endsWith(".ts")) &&
      !!localFiles.some((x) => x.path == currentFile) &&
      isReactComponentExported
      ? currentFile
      : state.defaultComponentFile
  }, [currentFile, localFiles, currentFileCode])

  const handleEditEvent = (event: ManualEditEvent) => {
    const parsedManualEdits = JSON.parse(localFiles.find((x) => x.path === "manual-edits.json")?.content || "{}")
    const newManualEditsFileContent = applyEditEventsToManualEditsFile({
      circuitJson: state.circuitJson,
      editEvents: [event],
      manualEditsFile: parsedManualEdits,
    })

    setLocalFiles((() => {
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
      return  updatedFiles
    })())
  }

  if ((!pkg && urlParams.package_id) || isLoading) {
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
    <div className="flex flex-col min-h-[50vh]">
      <h1>{Object.keys(fsMap).join(", ")}</h1>
      <EditorNav
        circuitJson={state.circuitJson}
        pkg={pkg}
        packageType={packageType}
        code={String(currentFileCode)}
        isSaving={updatePackageFilesMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={saveFiles}
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
            handleCreateFile={createFile}
            handleDeleteFile={deleteFile}
            currentFile={currentFile}
            setCurrentFile={onFileSelect}
            files={localFiles}
            onCodeChange={(newCode, filename) => {
              const targetFilename = filename ?? currentFile
              setLocalFiles((prev) => prev.map((file) =>
                file.path === targetFilename
                  ? { ...file, content: newCode }
                  : file,
              ))
            }}
            pkgFilesLoaded={!isLoading}
          />
        </div>
        {state.showPreview && (
          <div
            className={cn(
              "flex p-0 flex-col min-h-[640px]",
              state.fullScreen
                ? "fixed inset-0 z-50 bg-white p-4 overflow-hidden"
                : "w-full md:w-1/2",
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
              fsMap={fsMap}
            />
          </div>
        )}
      </div>
      <NewPackageSaveDialog
        initialIsPrivate={false}
        onSave={handleNewPackageSaveRequest}
      />
    </div>
  )
}
