import { CodeEditor } from "@/components/p/CodeEditor"
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
import type { Package, Snippet } from "fake-snippets-api/lib/db/schema"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "react-query"
import EditorNav from "@/components/p/EditorNav"
import { SuspenseRunFrame } from "../SuspenseRunFrame"
import { applyEditEventsToManualEditsFile } from "@tscircuit/core"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { useLatestPackageRelease } from "@/hooks/use-package-release"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"

interface Props {
  pkg?: Package
}

interface PackageFile {
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

  const loadPkgFiles = async () => {
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

    let isMounted = true

    try {
      const results = await Promise.all(
        pkgFiles.data.map(async (x) => {
          try {
            if (
              x.file_path === "index.tsx" &&
              indexFileFromHook.data?.content_text
            ) {
              return {
                path: x.file_path,
                content: indexFileFromHook.data.content_text,
              }
            }

            const response = await axios.post(`/package_files/get`, {
              package_file_id: x.package_file_id,
            })
            const content = response.data.package_file?.content_text ?? ""
            return content ? { path: x.file_path, content } : null
          } catch (error) {
            console.error(`Failed to load ${x.file_path}:`, error)
            return null
          }
        }),
      )

      if (isMounted) {
        const processedResults = results.filter(
          (x): x is PackageFile => x !== null,
        )

        if (!processedResults.some((f) => f.path === "manual-edits.json")) {
          processedResults.push({
            path: "manual-edits.json",
            content: DEFAULT_MANUAL_EDITS,
          })
        }

        setPkgFilesWithContent(processedResults)
        setInitialFilesLoad(processedResults)
        setLastRunCode(
          processedResults.find((x) => x.path === "index.tsx")?.content ??
            defaultCode,
        )
      }
    } catch (error) {
      console.error("Error loading package files:", error)
    }

    return () => {
      isMounted = false
    }
  }

  useEffect(() => {
    if (pkg && pkgFiles.data) {
      loadPkgFiles()
    }
  }, [pkg, pkgFiles.data])

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

  const updatePackageFilesMutation = useMutation({
    mutationFn: async (
      newpackage: Pick<Package, "package_id" | "name"> & {
        package_name_with_version: string
      },
    ) => {
      if (pkg) {
        newpackage = { ...pkg, ...newpackage }
      }
      if (!newpackage) throw new Error("No package to update")

      let updatedFilesCount = 0

      for (const file of pkgFilesWithContent) {
        const initialFile = initialFilesLoad.find((x) => x.path === file.path)
        if (file.content && file.content !== initialFile?.content) {
          const updatePkgFilePayload = {
            package_file_id:
              pkgFiles.data?.find((x) => x.file_path === file.path)
                ?.package_file_id ?? null,
            content_text: file.content,
            file_path: file.path,
            package_name_with_version: `${newpackage.name}`,
          }

          const response = await axios.post(
            "/package_files/create_or_update",
            updatePkgFilePayload,
          )

          if (response.status === 200) {
            updatedFilesCount++
          }
        }
      }
      return updatedFilesCount
    },
    onSuccess: (updatedFilesCount) => {
      if (updatedFilesCount) {
        toast({
          title: `Package's ${updatedFilesCount} files saved`,
          description: "Your changes have been saved successfully.",
        })
        loadPkgFiles()
      }
    },
    onError: (error) => {
      console.error("Error updating pkg files:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update package files. Please try again.",
        variant: "destructive",
      })
    },
  })

  const updatePackageMutation = useMutation({
    mutationFn: async () => {
      if (!pkg) throw new Error("No package to update")

      const updatePkgPayload = {
        package_id: pkg.package_id,
        code,
        dts,
        circuit_json: circuitJson,
        manual_edits_json_content: manualEditsFileContent,
      }

      try {
        const response = await axios.post("/packages/update", updatePkgPayload)
        return response.data
      } catch (error: any) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["package", pkg?.package_id] })
      toast({
        title: "Package saved",
        description: "Your changes have been saved successfully.",
      })
    },
    onError: (error) => {
      console.error("Error saving pkg:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save the package. Please try again.",
        variant: "destructive",
      })
    },
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
