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
import { isValidFileName } from "@/lib/utils/isValidFileName"
import { useFileManagement } from "@/hooks/useFileManagement"

interface Props {
  pkg?: Package
}

export interface PackageFile {
  path: string
  content: string
}

export interface CreateFileProps {
  newFileName: string
  setErrorMessage: (message: string) => void
  onFileSelect: (fileName: string) => void
  setNewFileName: (fileName: string) => void
  setIsCreatingFile: (isCreatingFile: boolean) => void
}

interface CodeAndPreviewState {
  pkgFilesWithContent: PackageFile[]
  initialFilesLoad: PackageFile[]
  showPreview: boolean
  fullScreen: boolean
  lastSavedAt: number
  circuitJson: null | any
  isPrivate: boolean
  lastRunCode: string
  pkgFilesLoaded: boolean
  currentFile: string
  defaultComponentFile?: string
}

const DEFAULT_CODE = `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)
`.trim()

const generateRandomPackageName = () =>
  `untitled-package-${Math.floor(Math.random() * 90) + 10}`

export function CodeAndPreview({ pkg }: Props) {
  const { toast } = useToast()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const loggedInUser = useGlobalStore((s) => s.session)
  const urlParams = useUrlParams()

  const templateFromUrl = useMemo(
    () => (urlParams.template ? getSnippetTemplate(urlParams.template) : null),
    [urlParams.template],
  )

  const pkgFiles = usePackageFiles(pkg?.latest_package_release_id)
  const indexFileFromHook = usePackageFileById(
    pkgFiles.data?.find((x) => x.file_path === "index.tsx")?.package_file_id ??
      null,
  )

  const defaultCode = useMemo(() => {
    if (indexFileFromHook.data?.content_text)
      return indexFileFromHook.data.content_text
    return (
      templateFromUrl?.code ??
      decodeUrlHashToText(window.location.toString()) ??
      (urlParams.package_id ? "" : DEFAULT_CODE)
    )
  }, [indexFileFromHook.data, templateFromUrl, urlParams.package_id])

  const { pkgFilesWithContent, handleCreateFile } = useFileManagement(
    !pkg ? [{ path: "index.tsx", content: defaultCode }] : [],
  )

  const [state, setState] = useState<CodeAndPreviewState>({
    pkgFilesWithContent,
    initialFilesLoad: [],
    showPreview: true,
    fullScreen: false,
    lastSavedAt: Date.now(),
    circuitJson: null,
    isPrivate: false,
    lastRunCode: defaultCode,
    pkgFilesLoaded: !urlParams.package_id,
    currentFile: "",
  })

  const manualEditsFileContent = useMemo(() => {
    return (
      state.pkgFilesWithContent.find((x) => x.path === "manual-edits.json")
        ?.content ?? ""
    )
  }, [state.pkgFilesWithContent])

  const entryPointCode = useMemo(() => {
    const defaultComponentFile = findTargetFile(state.pkgFilesWithContent, null)
    if (defaultComponentFile?.content) {
      setState((prev) => ({
        ...prev,
        defaultComponentFile: defaultComponentFile.path,
      }))
      return defaultComponentFile.content
    }
    return (
      state.pkgFilesWithContent.find((x) => x.path === "index.tsx")?.content ??
      defaultCode
    )
  }, [state.pkgFilesWithContent, defaultCode])

  const packageType =
    pkg?.snippet_type ?? templateFromUrl?.type ?? urlParams.snippet_type

  const { Dialog: NewPackageSaveDialog, openDialog: openNewPackageSaveDialog } =
    usePackageVisibilitySettingsDialog()

  const { data: loadedFiles, isLoading: isLoadingFiles } =
    usePackageFilesLoader(pkg)

  useEffect(() => {
    if (!pkgFiles.data?.length) {
      if (pkg && state.pkgFilesWithContent.length === 0) {
        const defaultFiles = [{ path: "index.tsx", content: defaultCode }]
        setState((prev) => ({
          ...prev,
          pkgFilesWithContent: defaultFiles,
          initialFilesLoad: defaultFiles,
          lastRunCode: defaultCode,
        }))
      }
      return
    }

    if (loadedFiles && !isLoadingFiles) {
      const processedResults = [...loadedFiles]
      setState((prev) => ({
        ...prev,
        pkgFilesWithContent: processedResults,
        pkgFilesLoaded: true,
        initialFilesLoad: processedResults,
        lastRunCode:
          processedResults.find((x) => x.path === "index.tsx")?.content ??
          defaultCode,
      }))
    }
  }, [isLoadingFiles, pkg, pkgFiles.data, defaultCode])

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
    pkgFilesWithContent: state.pkgFilesWithContent,
    initialFilesLoad: state.initialFilesLoad,
    pkgFiles,
    axios,
    toast,
  })

  const hasUnsavedChanges = useMemo(
    () =>
      !updatePackageFilesMutation.isLoading &&
      Date.now() - state.lastSavedAt > 1000 &&
      state.pkgFilesWithContent.some((file) => {
        const initialFile = state.initialFilesLoad.find(
          (x) => x.path === file.path,
        )
        return initialFile?.content !== file.content
      }),
    [
      state.pkgFilesWithContent,
      state.initialFilesLoad,
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

  const handleSave = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Not Logged In",
        description: "You must be logged in to save your package.",
        variant: "destructive",
      })
      return
    }

    if (!pkg) {
      openNewPackageSaveDialog()
      return
    }

    setState((prev) => ({ ...prev, lastSavedAt: Date.now() }))

    if (pkg) {
      updatePackageFilesMutation.mutate(
        {
          package_name_with_version: `${pkg.name}@latest`,
          ...pkg,
        },
        {
          onSuccess: () => {
            setState((prev) => ({
              ...prev,
              initialFilesLoad: [...prev.pkgFilesWithContent],
            }))
            pkgFiles.refetch()
          },
        },
      )
    }
  }

  const currentFileCode = useMemo(
    () =>
      state.pkgFilesWithContent.find((x) => x.path === state.currentFile)
        ?.content ??
      state.defaultComponentFile ??
      DEFAULT_CODE,
    [state.pkgFilesWithContent, state.currentFile],
  )

  const fsMap = useMemo(() => {
    return {
      "manual-edits.json": manualEditsFileContent || "{}",
      ...state.pkgFilesWithContent.reduce(
        (acc, file) => {
          acc[file.path] = file.content
          return acc
        },
        {} as Record<string, string>,
      ),
    }
  }, [
    manualEditsFileContent,
    entryPointCode,
    packageType,
    state.pkgFilesWithContent,
  ])
  const mainComponentPath = useMemo(() => {
    const isReactComponentExported =
      /export function\s+\w+/.test(currentFileCode) ||
      /export const\s+\w+\s*=/.test(currentFileCode) ||
      /export default\s+\w+/.test(currentFileCode) ||
      /export default\s+function\s*(\w*)\s*\(/.test(currentFileCode) ||
      /export default\s*\(\s*\)\s*=>/.test(currentFileCode)

    return (state.currentFile?.endsWith(".tsx") ||
      state.currentFile?.endsWith(".ts")) &&
      !!state.pkgFilesWithContent.some((x) => x.path == state.currentFile) &&
      isReactComponentExported
      ? state.currentFile
      : state.defaultComponentFile
  }, [state.currentFile, state.pkgFilesWithContent, currentFileCode])

  const handleEditEvent = (event: ManualEditEvent) => {
    const parsedManualEdits = JSON.parse(manualEditsFileContent || "{}")
    const newManualEditsFileContent = applyEditEventsToManualEditsFile({
      circuitJson: state.circuitJson,
      editEvents: [event],
      manualEditsFile: parsedManualEdits,
    })

    setState((prev) => {
      const manualEditsIndex = prev.pkgFilesWithContent.findIndex(
        (file) => file.path === "manual-edits.json",
      )

      const updatedFiles = [...prev.pkgFilesWithContent]

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
      return {
        ...prev,
        pkgFilesWithContent: updatedFiles,
      }
    })
  }

  if ((!pkg && urlParams.package_id) || pkgFiles.isLoading || isLoadingFiles) {
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
      <EditorNav
        circuitJson={state.circuitJson}
        pkg={pkg}
        packageType={packageType}
        code={String(currentFileCode)}
        isSaving={updatePackageFilesMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
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
            handleCreateFile={handleCreateFile}
            currentFile={state.currentFile}
            setCurrentFile={(file) =>
              setState((prev) => ({ ...prev, currentFile: file }))
            }
            files={pkgFilesWithContent}
            onCodeChange={(newCode, filename) => {
              const targetFilename = filename ?? state.currentFile
              setState((prev) => ({
                ...prev,
                pkgFilesWithContent: prev.pkgFilesWithContent.map((file) =>
                  file.path === targetFilename
                    ? { ...file, content: newCode }
                    : file,
                ),
              }))
            }}
            pkgFilesLoaded={state.pkgFilesLoaded}
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
