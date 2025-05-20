import { Dispatch, SetStateAction } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import {
  CodeAndPreviewState,
  CreateFileProps,
} from "../components/package-port/CodeAndPreview"

export function useFileManagement(
  state: CodeAndPreviewState,
  setState: Dispatch<SetStateAction<CodeAndPreviewState>>,
) {
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

    const fileExists = state.pkgFilesWithContent.some(
      (file) => file.path === newFileName,
    )

    if (fileExists) {
      setErrorMessage("A file with this name already exists")
      return
    }

    setState((prev) => {
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

  return {
    handleCreateFile,
  }
}
