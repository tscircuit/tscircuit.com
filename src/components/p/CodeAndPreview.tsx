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

  const indexFileFromHook = usePackageFileById(
    pkgFiles.data?.find((x) => x.file_path === "index.tsx")?.package_file_id ??
      null,
  )

  const defaultCode: string = useMemo(() => {
    // If package files exist and index file content is loaded, use it
    if (indexFileFromHook.data?.content_text) {
      return indexFileFromHook.data.content_text
    }

    // Otherwise, use template or other fallbacks
    return (
      templateFromUrl?.code ??
      decodeUrlHashToText(window.location.toString()) ??
      (urlParams.package_id && "") ?? // Use empty string if package_id exists but data not loaded
      `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)`.trim()
    )
  }, [
    indexFileFromHook.data,
    templateFromUrl,
    urlParams.package_id, // Keep dependency on urlParams.package_id
  ])

  const defaultManualEdits = "{}"

  const [pkgFilesWithContent, setPkgFilesWithContent] = useState<PackageFile[]>(
    () => {
      // Initialize with default files ONLY if no package is provided (new/template scenario)
      if (!pkg) {
        return [
          { path: "index.tsx", content: defaultCode },
          { path: "manual-edits.json", content: defaultManualEdits },
        ]
      }
      // Otherwise, start empty; loadPkgFiles will populate if pkg exists
      return []
    },
  )

  const [initialFilesLoad, setInitialFilesLoad] = useState<PackageFile[]>([])

  const entryPointCode = useMemo(() => {
    const indexFile = pkgFilesWithContent.find((x) => x.path == "index.tsx")
    return indexFile?.content ?? defaultCode // Fallback to defaultCode if not found
  }, [pkgFilesWithContent, defaultCode])

  const loadPkgFiles = async () => {
    // Skip if no package files data from the hook
    if (!pkgFiles.data?.length) {
      // If pkg exists but no files, initialize with defaults (edge case?)
      if (pkg && pkgFilesWithContent.length === 0) {
        setPkgFilesWithContent([
          { path: "index.tsx", content: defaultCode },
          { path: "manual-edits.json", content: defaultManualEdits },
        ])
        setInitialFilesLoad([
          { path: "index.tsx", content: defaultCode },
          { path: "manual-edits.json", content: defaultManualEdits },
        ])
        setLastRunCode(defaultCode)
      }
      return
    }

    // Track if component is still mounted
    let isMounted = true

    try {
      const results = await Promise.all(
        pkgFiles.data.map(async (x) => {
          try {
            // Use the hook data directly if available (avoids extra fetch for index)
            if (
              x.file_path === "index.tsx" &&
              indexFileFromHook.data?.content_text
            ) {
              return {
                path: x.file_path,
                content: indexFileFromHook.data.content_text,
              }
            }
            // Fetch other files
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

        // Ensure manual-edits.json exists if not loaded
        if (!processedResults.some((f) => f.path === "manual-edits.json")) {
          processedResults.push({
            path: "manual-edits.json",
            content: defaultManualEdits,
          })
        }

        setPkgFilesWithContent(processedResults)
        setInitialFilesLoad(processedResults) // Set initial load state after fetching
        setLastRunCode(
          processedResults.find((x) => x.path == "index.tsx")?.content ??
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
    // Load files only when a package exists and its files data is available
    if (pkg && pkgFiles.data) {
      loadPkgFiles()
    }
    // If no package, ensure default state is set (handled by useState initializer)
  }, [pkg, pkgFiles.data]) // Depend on pkg and pkgFiles.data

  const manualEditsFileContentFromState = useMemo(() => {
    return (
      pkgFilesWithContent.find((f) => f.path === "manual-edits.json")
        ?.content ?? defaultManualEdits
    )
  }, [pkgFilesWithContent])

  // State for manual edits, derived from pkgFilesWithContent
  const [manualEditsFileContent, setManualEditsFileContent] = useState<string>(
    manualEditsFileContentFromState,
  )

  // Effect to sync manualEditsFileContent state when pkgFilesWithContent changes
  useEffect(() => {
    const contentFromFiles =
      pkgFilesWithContent.find((f) => f.path === "manual-edits.json")
        ?.content ?? defaultManualEdits
    if (contentFromFiles !== manualEditsFileContent) {
      setManualEditsFileContent(contentFromFiles)
    }
  }, [pkgFilesWithContent])

  // State for the code editor's current content (primarily index.tsx)
  const [code, setCode] = useState(entryPointCode)

  // Effect to sync code state when entryPointCode changes
  useEffect(() => {
    if (entryPointCode !== code) {
      setCode(entryPointCode)
    }
  }, [entryPointCode])

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
    initialFilesLoad.find((f) => f.path === "manual-edits.json")?.content !==
    pkgFilesWithContent.find((f) => f.path === "manual-edits.json")?.content

  const hasUnsavedChanges =
    !updatePackageMutation.isLoading &&
    Date.now() - lastSavedAt > 1000 &&
    pkgFilesWithContent.some((file) => {
      // Check against initialFilesLoad, which is set after files are loaded/defaults applied
      const initialFile = initialFilesLoad.find((x) => x.path === file.path)
      return initialFile?.content !== file.content
    })

  const hasUnrunChanges = entryPointCode !== lastRunCode // Compare against entryPointCode derived from state

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
    <div className="flex flex-col min-h-[50vh]">
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
            // initialCode={defaultCode} // Remove initialCode prop, files prop handles it
            onCodeChange={(newCode, filename) => {
              const targetFilename = filename ?? "index.tsx" // Default to index.tsx
              setPkgFilesWithContent((currentFiles) =>
                currentFiles.map((file) => {
                  if (file.path === targetFilename) {
                    return { ...file, content: newCode }
                  }
                  return file
                }),
              )
              // No need to call setCode or setManualEditsFileContent here,
              // useEffect hooks handle syncing those states from pkgFilesWithContent
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
