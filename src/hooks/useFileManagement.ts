import { useState } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import { PackageFile } from "../components/package-port/CodeAndPreview"

interface CreateFileProps {
  newFileName: string
  setErrorMessage: (message: string) => void
  onFileSelect: (fileName: string) => void
  setNewFileName: (fileName: string) => void
  setIsCreatingFile: (isCreatingFile: boolean) => void
}

interface UseFileManagement {
  pkgFilesWithContent: PackageFile[]
  handleCreateFile: (props: CreateFileProps) => void
}

export function useFileManagement(
  initialFiles: PackageFile[],
): UseFileManagement {
  const [pkgFilesWithContent, setPkgFilesWithContent] =
    useState<PackageFile[]>(initialFiles)

  const handleCreateFile = ({
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

    const fileExists = pkgFilesWithContent.some(
      (file) => file.path === newFileName,
    )

    if (fileExists) {
      setErrorMessage("A file with this name already exists")
      return
    }

    setPkgFilesWithContent((prev) => [
      ...prev,
      { path: newFileName, content: "" },
    ])
    onFileSelect(newFileName)
    setIsCreatingFile(false)
    setNewFileName("")
  }

  return {
    pkgFilesWithContent,
    handleCreateFile,
  }
}
