import { Dispatch, SetStateAction } from "react"
import { isValidFileName } from "@/lib/utils/isValidFileName"
import {
  CodeAndPreviewState,
  CreateFileProps,
  DeleteFileProps,
} from "../components/package-port/CodeAndPreview"
import toast from "react-hot-toast"
import { useAxios } from "./use-axios"

export function useFileManagement(
  state: CodeAndPreviewState,
  setState: Dispatch<SetStateAction<CodeAndPreviewState>>,
) {
  const axios = useAxios()
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

  const handleDeleteFile = async ({ filename }: DeleteFileProps) => {
    const fileExists = state.pkgFilesWithContent.some(
      (file) => file.path === filename,
    )

    if (!fileExists) {
      toast.error("A file with this name doesn't exist")
      return
    }

    setState((prev) => {
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

  return {
    handleCreateFile,
    handleDeleteFile,
  }
}
