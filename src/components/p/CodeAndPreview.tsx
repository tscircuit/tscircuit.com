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

const randomPackageName = () =>
  `untitled-${"package"}-${Math.floor(Math.random() * 90) + 10}`

export function CodeAndPreview({ pkg }: Props) {
  const axios = useAxios()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const loggedInUser = useGlobalStore((s) => s.session)

  const urlParams = useUrlParams()
  const templateFromUrl = useMemo(
    () => (urlParams.template ? getSnippetTemplate(urlParams.template) : null),
    [],
  )
  const pkgFiles = usePackageFiles(pkg?.latest_package_release_id)
  interface PackageFile {
    path: string
    content: string
  }
  const indexFile = usePackageFileById(
    pkgFiles.data?.find((x) => x.file_path === "index.tsx")?.package_file_id ??
      null,
  )

  const [pkgFilesWithContent, setPkgFilesWithContent] = useState<PackageFile[]>(
    [],
  )
  const [initialFilesLoad, setInitialFilesLoad] = useState<PackageFile[]>([])
  const defaultCode: string = useMemo(() => {
    // If package files exist, use the index file content
    if (pkgFiles.data?.length && indexFile.data?.content_text) {
      return indexFile.data.content_text
    }

    // Otherwise, use template or other fallbacks
    return (
      templateFromUrl?.code ??
      decodeUrlHashToText(window.location.toString()) ??
      (urlParams.package_id && "") ??
      `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)`.trim()
    )
  }, [
    indexFile.data,
    pkgFiles.data,
    pkgFilesWithContent,
    urlParams.package_id,
    templateFromUrl,
  ])

  const entryPointCode = useMemo(() => {
    if (pkgFilesWithContent.find((x) => x.path == "index.tsx")) {
      return pkgFilesWithContent.find((x) => x.path == "index.tsx")?.content
    } else {
      return defaultCode
    }
  }, [pkgFilesWithContent, defaultCode])
  const loadPkgFiles = async () => {
    // Skip if no package files data
    if (!pkgFiles.data?.length) {
      return
    }

    // Track if component is still mounted
    let isMounted = true

    try {
      const results = await Promise.all(
        pkgFiles.data.map(async (x) => {
          try {
            const response = await axios.post(`/package_files/get`, {
              package_file_id: x.package_file_id,
            })
            const content = response.data.package_file?.content_text ?? ""
            return content
              ? {
                  path: x.file_path,
                  content: content,
                }
              : null
          } catch (error) {
            console.error(`Failed to load ${x.file_path}:`, error)
            return null
          }
        }),
      )

      // Only update state if component is still mounted
      if (isMounted) {
        const processedResults = results.filter(
          (x): x is PackageFile => x !== null,
        )
        const newFiles = processedResults.filter(
          (file) =>
            !pkgFilesWithContent.find(
              (existingFile) => existingFile.path === file.path,
            ),
        )
        setPkgFilesWithContent([...pkgFilesWithContent, ...newFiles])
        setInitialFilesLoad([...pkgFilesWithContent, ...newFiles])
        setLastRunCode(
          processedResults.find((x) => x.path == "index.tsx")?.content ?? "",
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
    loadPkgFiles()
  }, [pkgFiles.data])

  const manualEditsFileContentFromPkgFiles =
    usePackageFileById(
      pkgFiles.data?.find((x) => x.file_path == "manual-edits.json")
        ?.package_file_id ?? null,
    ).data?.content_text ?? "{}"

  // Initialize with template or snippet's manual edits if available
  const [manualEditsFileContent, setManualEditsFileContent] = useState<string>(
    manualEditsFileContentFromPkgFiles,
  )
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
  const packageType: "board" | "package" | "model" | "footprint" =
    pkg?.snippet_type ??
    (templateFromUrl?.type as any) ??
    urlParams.snippet_type

  const { toast } = useToast()

  const userImports = useMemo(
    () => ({
      "./manual-edits.json": parseJsonOrNull(manualEditsFileContent) ?? {},
    }),
    [manualEditsFileContent],
  )

  const qc = useQueryClient()

  const updatePackageFilesMutation = useMutation({
    mutationFn: async (
      newpackage: Pick<Package, "package_id"> & {
        package_name_with_version: string
      },
    ) => {
      if (pkg) {
        newpackage = { ...pkg, ...newpackage }
      }
      if (!newpackage) throw new Error("No package to update")
      let updatedFilesCount = 0
      // Update all changed files in the package
      for (const file of pkgFilesWithContent) {
        if (
          file.content !==
          initialFilesLoad?.find((x) => x.path === file.path)?.content
        ) {
          const updatePkgFilePayload = {
            package_file_id:
              pkgFiles.data?.find((x) => x.file_path === file.path)
                ?.package_file_id ?? null,
            content_text: file.content,
            file_path: file.path,
            ...newpackage,
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

      // TODO UPDATE FOR EACH FILE
      const updatePkgPayload = {
        package_id: pkg?.package_id,
        code: code,
        dts: dts,
        // compiled_js: compiledJs,
        circuit_json: circuitJson,
        manual_edits_json_content: manualEditsFileContent,
      }

      try {
        const response = await axios.post("/packages/update", updatePkgPayload)
        return response.data
      } catch (error: any) {
        // const responseStatus = error?.status ?? error?.response?.status
        // We would normally only do this if the error is a 413, but we're not
        // able to check the status properly because of the browser CORS policy
        // (the PAYLOAD_TOO_LARGE error does not have the proper CORS headers)
        // if (
        //   import.meta.env.VITE_ALTERNATE_REGISTRY_URL &&
        //   (responseStatus === undefined || responseStatus === 413)
        // ) {
        //   console.log(`Failed to update snippet, attempting alternate registry`)
        //   const response = await axios.post(
        //     `${import.meta.env.VITE_ALTERNATE_REGISTRY_URL}/snippets/update`,
        //     updateSnippetPayload,
        //   )
        //   return response.data
        // }
        throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["package", pkg?.package_id] })
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

  const createPackageMutation = useCreatePackageMutation()
  const [lastSavedAt, setLastSavedAt] = useState(Date.now())

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
      const new_package = await createPackageMutation.mutateAsync({
        name: `${loggedInUser?.github_username}/${randomPackageName()}`,
        is_private: isPrivate,
      })
      createRelease({
        package_name_with_version: `${new_package?.name}@latest`,
      })
      updatePackageFilesMutation.mutate({
        package_name_with_version: `${new_package?.name}@latest`,
        ...new_package,
      })
    }
  }
  const { mutate: createRelease, isLoading: isCreatingRelease } =
    useCreatePackageReleaseMutation({
      onSuccess: () => {
        toast({
          title: "Package released",
          description: "Your package has been released successfully.",
        })
      },
    })

  const hasManualEditsChanged =
    (manualEditsFileContentFromPkgFiles ?? "") !==
    (manualEditsFileContent ?? "")

  // const hasUnsavedChanges =
  //   !updatePackageMutation.isLoading &&
  //   Date.now() - lastSavedAt > 1000 &&
  //   (indexFileContent !== code || hasManualEditsChanged);
  const hasUnsavedChanges =
    !updatePackageMutation.isLoading &&
    Date.now() - lastSavedAt > 1000 &&
    pkgFilesWithContent.some((file) => {
      if (initialFilesLoad.length == 0) return
      if (pkgFilesWithContent.length == 0) return
      return (
        initialFilesLoad?.find((x) => x.path === file.path)?.content !==
        file.content
      )
    })
  const hasUnrunChanges = code !== lastRunCode

  useWarnUserOnPageChange({ hasUnsavedChanges })

  const fsMap = useMemo(() => {
    const possibleExportNames = [
      ...(code.match(/export function (\w+)/)?.slice(1) ?? []),
      ...(code.match(/export const (\w+) ?=/)?.slice(1) ?? []),
    ]

    const exportName = possibleExportNames[0]

    let entrypointContent: string
    if (packageType === "board") {
      entrypointContent = `
        import ${
          exportName ? `{ ${exportName} as Snippet }` : "Snippet"
        } from "./index.tsx"
        circuit.add(<Snippet />)
      `.trim()
    } else {
      entrypointContent = `
        import ${
          exportName ? `{ ${exportName} as Snippet }` : "Snippet"
        } from "./index.tsx"
        circuit.add(
          <board>
            <Snippet name="U1" />
          </board>
        )
      `.trim()
    }
    return {
      "index.tsx": entryPointCode ?? "// No Default Code Found",
      "manual-edits.json": manualEditsFileContent ?? "{}",
      "main.tsx": entrypointContent,
    }
  }, [manualEditsFileContent, entryPointCode])

  if (!pkg && urlParams.package_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center justify-center">
          <div className="text-lg text-gray-500 mb-4">Loading</div>
          <Loader2 className="w-16 h-16 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (pkgFiles.isLoading) {
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
        pkg={pkg}
        packageType={packageType}
        code={code}
        isSaving={updatePackageMutation.isLoading}
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => handleSave()}
        onTogglePreview={() => setShowPreview(!showPreview)}
        previewOpen={showPreview}
        canSave={!hasUnrunChanges} // Disable save if there are unrun changes
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
            // manualEditsFileContent={manualEditsFileContent ?? ""}
            // onManualEditsFileContentChanged={(newContent) => {
            //   setManualEditsFileContent(newContent)
            // }}
            // initialCode={defaultCode}
            onCodeChange={(newCode, filename) => {
              setCode(newCode)
              // Update the file content based on the filename
              setPkgFilesWithContent(
                pkgFilesWithContent.map((x) => {
                  // If filename is provided, update that specific file
                  if (filename && x.path === filename) {
                    return { path: filename, content: newCode }
                  }
                  // If no filename but path is index.tsx, update it
                  if (!filename && x.path === "index.tsx") {
                    return { path: "index.tsx", content: newCode }
                  }
                  // Keep other files unchanged
                  return x
                }),
              )
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
                    manualEditsFile: JSON.parse(manualEditsFileContent),
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
          const new_package = await createPackageMutation.mutateAsync({
            name: `${loggedInUser?.github_username}/${randomPackageName()}`,
            is_private: isPrivate,
          })
          createRelease({
            package_name_with_version: `${new_package?.name}@latest`,
          })
          updatePackageFilesMutation.mutate({
            package_name_with_version: `${new_package?.name}@latest`,
            ...new_package,
          })
        }}
      />
    </div>
  )
}
