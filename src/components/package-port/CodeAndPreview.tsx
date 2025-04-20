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
import { parseJsonOrNull } from "@/lib/utils/parseJsonOrNull"
import "@/prettier"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "react-query"
import EditorNav from "@/components/package-port/EditorNav"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useUpdatePackageFilesMutation } from "@/hooks/useUpdatePackageFilesMutation"
import { useUpdatePackageMutation } from "@/hooks/useUpdatePackageMutation"
import { usePackageFilesLoader } from "@/hooks/usePackageFilesLoader"
import { findTargetFile } from "@/lib/utils/findTargetFile"

interface Props {
  pkg?: Package
}

export interface PackageFile {
  path: string
  content: string
}

const DEFAULT_MANUAL_EDITS = ""
const DEFAULT_CODE = `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)`.trim()

const generateRandomPackageName = () =>
  `untitled-package-${Math.floor(Math.random() * 90) + 10}`

export function CodeAndPreview({ pkg }: Props) {
  const axios = useAxios()
  const queryClient = useQueryClient()
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
    if (indexFileFromHook.data?.content_text) {
      return indexFileFromHook.data.content_text
    }

    return (
      templateFromUrl?.code ??
      decodeUrlHashToText(window.location.toString()) ??
      (urlParams.package_id ? "" : DEFAULT_CODE)
    )
  }, [indexFileFromHook.data, templateFromUrl, urlParams.package_id])

  const [pkgFilesWithContent, setPkgFilesWithContent] = useState<PackageFile[]>(
    !pkg
      ? [
          { path: "index.tsx", content: defaultCode },
          { path: "manual-edits.json", content: DEFAULT_MANUAL_EDITS },
        ]
      : [],
  )

  const [initialFilesLoad, setInitialFilesLoad] = useState<PackageFile[]>([])
  const [showPreview, setShowPreview] = useState(true)
  const [fullScreen, setFullScreen] = useState(false)
  const [dts, setDts] = useState("")
  const [lastSavedAt, setLastSavedAt] = useState(Date.now())
  const [circuitJson, setCircuitJson] = useState<any>(null)
  const [isPrivate, setIsPrivate] = useState(false)

  const entryPointCode = useMemo(() => {
    const entryPointFile = findTargetFile(pkgFilesWithContent, null)
    if (entryPointFile && entryPointFile.content) return entryPointFile.content
    return (
      pkgFilesWithContent.find((x) => x.path === "index.tsx")?.content ??
      defaultCode
    )
  }, [pkgFilesWithContent, defaultCode])

  const [lastRunCode, setLastRunCode] = useState(defaultCode)
  const [code, setCode] = useState(entryPointCode)

  const manualEditsFileContentFromState = useMemo(() => {
    return (
      pkgFilesWithContent.find((f) => f.path === "manual-edits.json")
        ?.content ?? DEFAULT_MANUAL_EDITS
    )
  }, [pkgFilesWithContent])

  const [manualEditsFileContent, setManualEditsFileContent] = useState(
    manualEditsFileContentFromState,
  )

  const packageType: "board" | "package" | "model" | "footprint" =
    pkg?.snippet_type ??
    (templateFromUrl?.type as any) ??
    urlParams.snippet_type

  const {
    Dialog: PackageVisibilitySettingsDialog,
    openDialog: openPackageVisibilitySettingsDialog,
  } = usePackageVisibilitySettingsDialog()

  const userImports = useMemo(
    () => ({
      "./manual-edits.json": parseJsonOrNull(manualEditsFileContent) ?? {},
    }),
    [manualEditsFileContent],
  )

  useEffect(() => {
    if (entryPointCode !== code) {
      setCode(entryPointCode)
    }
  }, [entryPointCode, code])

  useEffect(() => {
    const contentFromFiles = manualEditsFileContentFromState
    if (contentFromFiles !== manualEditsFileContent) {
      setManualEditsFileContent(contentFromFiles)
    }
  }, [manualEditsFileContentFromState, manualEditsFileContent])

  const { data: loadedFiles, isLoading: isLoadingFiles } =
    usePackageFilesLoader(pkg)

  const [pkgFilesLoaded, setPkgFilesLoaded] = useState<boolean>(
    urlParams.package_id ? false : true,
  )

  useEffect(() => {
    if (!pkgFiles.data?.length) {
      if (pkg && pkgFilesWithContent.length === 0) {
        const defaultFiles = [
          { path: "index.tsx", content: defaultCode },
          { path: "manual-edits.json", content: DEFAULT_MANUAL_EDITS },
        ]
        setPkgFilesWithContent(defaultFiles)
        setInitialFilesLoad(defaultFiles)
        setLastRunCode(defaultCode)
      }
      return
    }

    if (loadedFiles && !isLoadingFiles) {
      const processedResults = [...loadedFiles]
      if (!processedResults.some((f) => f.path === "manual-edits.json")) {
        processedResults.push({
          path: "manual-edits.json",
          content: DEFAULT_MANUAL_EDITS,
        })
      }

      setPkgFilesWithContent(processedResults)
      setPkgFilesLoaded(true)
      setInitialFilesLoad(processedResults)
      setLastRunCode(
        processedResults.find((x) => x.path === "index.tsx")?.content ??
          defaultCode,
      )
    }
  }, [
    isLoadingFiles,
    pkg,
    pkgFiles.data,
    pkgFilesWithContent.length,
    defaultCode,
  ])

  const createPackageMutation = useCreatePackageMutation()

  const { mutate: createRelease, isLoading: isCreatingRelease } =
    useCreatePackageReleaseMutation({
      onSuccess: () => {
        toast({
          title: "Package released",
          description: "Your package has been released successfully.",
        })
      },
    })
  const loadPkgFiles = () => {
    pkgFiles.refetch()
  }
  const updatePackageFilesMutation = useUpdatePackageFilesMutation({
    pkg,
    pkgFilesWithContent,
    initialFilesLoad,
    pkgFiles,
    axios,
    toast,
    loadPkgFiles,
  })

  const updatePackageMutation = useUpdatePackageMutation({
    pkg,
    code,
    dts,
    circuitJson,
    manualEditsFileContent,
  })

  const hasUnrunChanges = entryPointCode !== lastRunCode

  const hasUnsavedChanges = useMemo(
    () =>
      !updatePackageMutation.isLoading &&
      Date.now() - lastSavedAt > 1000 &&
      pkgFilesWithContent.some((file) => {
        const initialFile = initialFilesLoad.find((x) => x.path === file.path)
        return initialFile?.content !== file.content
      }),
    [
      pkgFilesWithContent,
      initialFilesLoad,
      updatePackageMutation.isLoading,
      lastSavedAt,
    ],
  )

  useWarnUserOnPageChange({ hasUnsavedChanges })

  const handleSave = async () => {
    if (hasUnrunChanges) {
      toast({
        title: "Warning",
        description: "You must run the package before saving your changes.",
        variant: "destructive",
      })
      return
    }

    if (!pkg && isLoggedIn) {
      openPackageVisibilitySettingsDialog()
      return
    }

    setLastSavedAt(Date.now())

    if (pkg) {
      updatePackageMutation.mutate()
      updatePackageFilesMutation.mutate({
        package_name_with_version: `${pkg.name}@latest`,
        ...pkg,
      })
    } else {
      const newPackage = await createPackageMutation.mutateAsync({
        name: `${loggedInUser?.github_username}/${generateRandomPackageName()}`,
        is_private: isPrivate,
      })

      if (newPackage) {
        createRelease({
          package_name_with_version: `${newPackage.name}@latest`,
        })

        updatePackageFilesMutation.mutate({
          package_name_with_version: `${newPackage.name}@latest`,
          ...newPackage,
        })
      }
    }
  }

  const fsMap = useMemo(() => {
    const possibleExportNames = [
      ...(code.match(/export function (\w+)/)?.slice(1) ?? []),
      ...(code.match(/export const (\w+) ?=/)?.slice(1) ?? []),
    ]

    const exportName = possibleExportNames[0]

    const importStatement = exportName
      ? `import { ${exportName} as Snippet } from "./index.tsx"`
      : `import Snippet from "./index.tsx"`

    const entrypointContent =
      packageType === "board"
        ? `${importStatement}\ncircuit.add(<Snippet />)`
        : `${importStatement}\ncircuit.add(\n  <board>\n    <Snippet name="U1" />\n  </board>\n)`

    return {
      "index.tsx": entryPointCode ?? "// No Default Code Found",
      "manual-edits.json": manualEditsFileContent ?? "{}",
      "main.tsx": entrypointContent.trim(),
    }
  }, [manualEditsFileContent, entryPointCode, code, packageType])

  if ((!pkg && urlParams.package_id) || pkgFiles.isLoading) {
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
        circuitJson={circuitJson}
        pkg={pkg}
        packageType={packageType}
        code={code}
        isSaving={updatePackageMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onTogglePreview={() => setShowPreview(!showPreview)}
        previewOpen={showPreview}
        canSave={!hasUnrunChanges}
        manualEditsFileContent={manualEditsFileContent}
      />
      <div className={`flex ${showPreview ? "flex-col md:flex-row" : ""}`}>
        <div
          className={cn(
            "hidden flex-col md:flex border-r border-gray-200 bg-gray-50",
            showPreview ? "w-full md:w-1/2" : "w-full flex",
          )}
        >
          <CodeEditor
            files={pkgFilesWithContent}
            onCodeChange={(newCode, filename) => {
              const targetFilename = filename ?? "index.tsx"
              setPkgFilesWithContent((currentFiles) =>
                currentFiles.map((file) =>
                  file.path === targetFilename
                    ? { ...file, content: newCode }
                    : file,
                ),
              )
            }}
            onDtsChange={setDts}
            pkgFilesLoaded={pkgFilesLoaded}
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
              onRenderStarted={() => setLastRunCode(code)}
              onRenderFinished={({ circuitJson }) =>
                setCircuitJson(circuitJson)
              }
              onEditEvent={(event) => {
                const parsedManualEdits = JSON.parse(manualEditsFileContent)
                const newManualEditsFileContent =
                  applyEditEventsToManualEditsFile({
                    circuitJson,
                    editEvents: [event],
                    manualEditsFile: parsedManualEdits,
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
        onSave={async (isPrivate: boolean) => {
          setLastSavedAt(Date.now())
          const newPackage = await createPackageMutation.mutateAsync({
            name: `${loggedInUser?.github_username}/${generateRandomPackageName()}`,
            is_private: isPrivate,
          })

          if (newPackage) {
            createRelease({
              package_name_with_version: `${newPackage.name}@latest`,
            })

            updatePackageFilesMutation.mutate({
              package_name_with_version: `${newPackage.name}@latest`,
              ...newPackage,
            })
          }
        }}
      />
    </div>
  )
}
