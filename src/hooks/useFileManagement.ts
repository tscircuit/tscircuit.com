import { Dispatch, SetStateAction, useMemo } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import {
  CodeAndPreviewState,
  CreateFileProps,
  DeleteFileProps,
  PackageFile,
} from "../components/package-port/CodeAndPreview"
import { useGlobalStore } from "./use-global-store"
import { useToast } from "@/components/ViewPackagePage/hooks/use-toast"
import { Package } from "fake-snippets-api/lib/db/schema"
import { UseMutationResult } from "react-query"

export function useFileManagement({
  setCodeAndPreviewState,
  pkg,
  updatePackageFilesMutation,
  openNewPackageSaveDialog,
  refetchPackageFiles,
  manualEditsFileContent,
  packageFilesWithContent,
}: {
  setCodeAndPreviewState: Dispatch<SetStateAction<CodeAndPreviewState>>
  pkg: Package | undefined
  updatePackageFilesMutation: UseMutationResult<any, Error, any, any>
  openNewPackageSaveDialog: () => void
  refetchPackageFiles: () => void
  manualEditsFileContent: string
  packageFilesWithContent: PackageFile[]
}) {
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const { toast } = useToast()

  const handleCreateFile = async ({
    newFileName,
    setErrorMessage,
    onFileSelect,
    setNewFileName,
    setIsCreatingFile,
  }: CreateFileProps) => {
    newFileName = newFileName.trim()
    if (!newFileName) {
      setErrorMessage("File name cannot be empty")
      return
    }
    if (!isValidFileName(newFileName)) {
      setErrorMessage(
        'Invalid file name. Avoid using special characters like <>:"/\\|?*',
      )
      return
    }
    setErrorMessage("")

    const fileExists = packageFilesWithContent.some(
      (file) => file.path === newFileName,
    )

    if (fileExists) {
      setErrorMessage("A file with this name already exists")
      return
    }

    setCodeAndPreviewState((prev) => {
      const updatedFiles = [
        ...prev.pkgFilesWithContent,
        { path: newFileName, content: "" },
      ]
      return {
        ...prev,
        pkgFilesWithContent: updatedFiles,
      } as CodeAndPreviewState
    })
    onFileSelect(newFileName)
    setIsCreatingFile(false)
    setNewFileName("")
  }

  const handleDeleteFile = async ({ filename }: DeleteFileProps) => {
    const fileExists = packageFilesWithContent.some(
      (file) => file.path === filename,
    )

    if (!fileExists) {
      toast({
        title: "A file with this name doesn't exist",
        variant: "destructive",
      })
      return
    }

    setCodeAndPreviewState((prev) => {
      const updatedFiles = prev.pkgFilesWithContent.filter(
        (file) => file.path !== filename,
      )
      return {
        ...prev,
        pkgFilesWithContent: updatedFiles,
        currentFile:
          updatedFiles.find((file) => file.path === prev.currentFile)?.path ||
          "",
      }
    })
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

    setCodeAndPreviewState((prev) => ({ ...prev, lastSavedAt: Date.now() }))

    if (pkg) {
      updatePackageFilesMutation.mutate(
        {
          package_name_with_version: `${pkg.name}@latest`,
          ...pkg,
        },
        {
          onSuccess: () => {
            setCodeAndPreviewState((prev) => ({
              ...prev,
              initiallyLoadedFiles: [...prev.pkgFilesWithContent],
            }))
            refetchPackageFiles()
          },
        },
      )
    }
  }

  const fsMap = useMemo(() => {
    return {
      "manual-edits.json": manualEditsFileContent || "{}",
      ...packageFilesWithContent.reduce(
        (acc, file) => {
          acc[file.path] = file.content
          return acc
        },
        {} as Record<string, string>,
      ),
    }
  }, [manualEditsFileContent, packageFilesWithContent])

  return {
    handleCreateFile,
    handleDeleteFile,
    handleSave,
    fsMap,
  }
}
