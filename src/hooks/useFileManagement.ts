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
    if (!state.pkg?.name) {
      toast.error("This is not a package file")
      return
    }

    const fileExists = state.pkgFilesWithContent.some(
      (file) => file.path === filename,
    )

    if (!fileExists) {
      toast.error("A file with this name doesn't exist")
      return
    }

    let response
    try {
      response = await axios.post("/package_files/delete", {
        file_path: filename,
        package_name_with_version: `${state.pkg?.name}`,
      })
    } catch (error: any) {
      console.log(error)
      toast.error(
        `Error deleting file: ${error.message || error.data?.error?.message || "Unknown error"}`,
      )
      return
    }

    if (response.status === 200) {
      setState((prev) => {
        const updatedFiles = prev.pkgFilesWithContent.filter(
          (file) => file.path !== filename,
        )
        return {
          ...prev,
          pkgFilesWithContent: updatedFiles,
        } as CodeAndPreviewState
      })

      toast.success(`File ${filename} deleted successfully`)
    } else {
      toast.error(`Failed to delete file: ${response.data.message}`)
    }
  }

  return {
    handleCreateFile,
    handleDeleteFile,
  }
}
