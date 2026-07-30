import { useImportComponentDialog } from "@/components/dialogs/import-component-dialog"
import { useGlobalStore } from "@/hooks/use-global-store"
import { openJlcpcbImportIssue } from "@/hooks/use-jlcpcb-component-import"
import { useToast } from "@/hooks/use-toast"
import type {
  ICreateFileProps,
  ICreateFileResult,
} from "@/hooks/useFileManagement"
import type {
  JlcpcbComponentTsxLoadedPayload,
  KicadStringSelectedPayload,
  TscircuitPackageSelectedPayload,
} from "@tscircuit/runframe/runner"
import { useCallback, useMemo } from "react"

export function useEditorComponentImport({
  currentFile,
  files,
  updateFileContent,
  createFile,
}: {
  currentFile: string | null
  files: Record<string, string>
  updateFileContent: (path: string, content: string) => void
  createFile: (props: ICreateFileProps) => ICreateFileResult
}) {
  const { Dialog: ImportComponentDialog, openDialog: openImportDialog } =
    useImportComponentDialog()
  const { toast } = useToast()
  const sessionToken = useGlobalStore((state) => state.session?.token)

  const jlcpcbProxyRequestHeaders = useMemo(
    () =>
      sessionToken
        ? {
            Authorization: `Bearer ${sessionToken}`,
          }
        : undefined,
    [sessionToken],
  )

  const handleTscircuitPackageSelected = useCallback(
    async ({ fullPackageName }: TscircuitPackageSelectedPayload) => {
      if (!currentFile) {
        const message = "Select a file before importing a component."
        toast({
          title: "No file selected",
          description: message,
          variant: "destructive",
        })
        throw new Error(message)
      }

      const existingContent = files[currentFile] ?? ""
      updateFileContent(
        currentFile,
        `import {} from "${fullPackageName}"\n${existingContent}`,
      )
      toast({
        title: "Component imported",
        description: `Added ${fullPackageName} to ${currentFile}.`,
      })
    },
    [currentFile, files, toast, updateFileContent],
  )

  const handleJlcpcbComponentTsxLoaded = useCallback(
    async ({ result, tsx }: JlcpcbComponentTsxLoadedPayload) => {
      const partNumber = result.component.partNumber || "component"

      try {
        const sanitizedBaseName = partNumber
          .toLowerCase()
          .replace(/[^a-z0-9_-]/gi, "-")
        let componentPath = `imports/${sanitizedBaseName}.tsx`
        let suffix = 1
        while (files[componentPath] || files[`./${componentPath}`]) {
          componentPath = `imports/${sanitizedBaseName}-${suffix}.tsx`
          suffix += 1
        }

        const createFileResult = createFile({
          newFileName: componentPath,
          content: tsx,
          onError: (error) => {
            throw error
          },
        })

        if (!createFileResult.newFileCreated) {
          throw new Error("Failed to create component file")
        }

        toast({
          title: "Component imported",
          description: `${partNumber} saved to ${componentPath}.`,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to import component from JLCPCB"

        toast({
          title: "JLCPCB import failed",
          description: (
            <div className="space-y-2">
              <p>{message}</p>
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={(event) => {
                  event.preventDefault()
                  openJlcpcbImportIssue(partNumber, message)
                }}
              >
                File issue on GitHub
              </button>
            </div>
          ),
          variant: "destructive",
        })

        throw new Error(message)
      }
    },
    [createFile, files, toast],
  )

  const handleKicadStringSelected = useCallback(
    async ({ footprint, result }: KicadStringSelectedPayload) => {
      try {
        await navigator.clipboard.writeText(footprint)
        toast({
          title: "KiCad footprint copied",
          description: `${result.footprint.qualifiedName} copied to clipboard.`,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to copy KiCad footprint to clipboard"
        toast({
          title: "KiCad import failed",
          description: message,
          variant: "destructive",
        })
        throw new Error(message)
      }
    },
    [toast],
  )

  const importComponentDialog = (
    <ImportComponentDialog
      onTscircuitPackageSelected={handleTscircuitPackageSelected}
      onJlcpcbComponentTsxLoaded={handleJlcpcbComponentTsxLoaded}
      onKicadStringSelected={handleKicadStringSelected}
      jlcpcbProxyRequestHeaders={jlcpcbProxyRequestHeaders}
    />
  )

  return { importComponentDialog, openImportDialog }
}
