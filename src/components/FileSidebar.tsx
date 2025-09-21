import React, { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { PanelRightOpen, Plus, Loader2 } from "lucide-react"
import { TreeView } from "@/components/ui/tree-view"
import { Input } from "@/components/ui/input"
import { transformFilesToTreeData } from "@/lib/utils/transformFilesToTreeData"
import { useGlobalStore } from "@/hooks/use-global-store"
import type {
  ICreateFileProps,
  ICreateFileResult,
  IDeleteFileProps,
  IDeleteFileResult,
  IRenameFileProps,
  IRenameFileResult,
} from "@/hooks/useFileManagement"
import type { Package } from "fake-snippets-api/lib/db/schema"
type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName | null
  onFileSelect: (filename: FileName) => void
  className?: string
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleCreateFile: (props: ICreateFileProps) => ICreateFileResult
  handleDeleteFile: (props: IDeleteFileProps) => IDeleteFileResult
  handleRenameFile: (props: IRenameFileProps) => IRenameFileResult
  isCreatingFile: boolean
  setIsCreatingFile: React.Dispatch<React.SetStateAction<boolean>>
  pkg?: Package
  isLoadingFiles?: boolean
  loadingProgress?: string | null
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
  fileSidebarState,
  handleCreateFile,
  handleDeleteFile,
  handleRenameFile,
  isCreatingFile,
  setIsCreatingFile,
  pkg,
  isLoadingFiles = true,
  loadingProgress = null,
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [newFileName, setNewFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [selectedFolderForCreation, setSelectedFolderForCreation] = useState<
    string | null
  >(null)
  const selectedItemId = useMemo(() => currentFile || "", [currentFile])
  const session = useGlobalStore((s) => s.session)
  const canModifyFiles =
    !pkg || pkg.owner_github_username === session?.github_username

  const onFolderSelect = (folderPath: string) => {
    setSelectedFolderForCreation(folderPath)
  }

  const treeData = transformFilesToTreeData({
    files,
    currentFile,
    renamingFile,
    handleRenameFile,
    handleDeleteFile,
    setRenamingFile,
    onFileSelect,
    onFolderSelect,
    canModifyFiles,
    setErrorMessage,
    setSelectedFolderForCreation,
  })

  const getCurrentFolderPath = (): string => {
    if (selectedFolderForCreation) {
      return selectedFolderForCreation
    }

    if (!selectedItemId || selectedItemId === "") return ""

    const hasLeadingSlash = selectedItemId.startsWith("/")
    const normalizedPath = hasLeadingSlash
      ? selectedItemId.slice(1)
      : selectedItemId
    const pathParts = selectedItemId.split("/")

    if (pathParts.length > 1) {
      const folderPath = pathParts.slice(0, -1).join("/")
      return hasLeadingSlash ? `/${folderPath}` : folderPath
    }

    return hasLeadingSlash ? "/" : ""
  }

  const constructFilePath = (fileName: string): string => {
    const trimmedFileName = fileName.trim()

    if (!trimmedFileName) {
      return ""
    }

    const currentFolder = getCurrentFolderPath()

    if (trimmedFileName.startsWith("/")) {
      return trimmedFileName
    }

    if (!currentFolder || currentFolder === "/") {
      const result =
        currentFolder === "/" ? `/${trimmedFileName}` : trimmedFileName
      return result
    }

    const result = `${currentFolder}/${trimmedFileName}`
    return result
  }
  const handleCreateFileInline = () => {
    const finalFileName = constructFilePath(newFileName)
    if (!finalFileName) {
      setErrorMessage("File name cannot be empty")
      return
    }

    const { newFileCreated } = handleCreateFile({
      newFileName: finalFileName,
      onError: (error) => {
        setErrorMessage(error.message)
      },
    })

    if (newFileCreated) {
      setIsCreatingFile(false)
      setNewFileName("")
      setErrorMessage("")
      onFileSelect(finalFileName)
      setSelectedFolderForCreation(null)
    }
  }

  const handleCreateFileBlur = () => {
    if (newFileName.trim() === "") {
      setIsCreatingFile(false)
      setNewFileName("")
      setErrorMessage("")
      setSelectedFolderForCreation(null)
      return
    }
    handleCreateFileInline()
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    setErrorMessage("")
    setIsCreatingFile(false)
    setNewFileName("")
    setSelectedFolderForCreation(null)
  }

  return (
    <div
      className={cn(
        "flex-shrink-0 transition-all duration-300 border-r relative",
        !sidebarOpen ? "w-0 overflow-hidden" : "w-[14rem]",
        className,
      )}
    >
      <div className="flex items-center justify-between px-2 pt-2">
        <button
          onClick={toggleSidebar}
          className={`text-gray-400 scale-90 transition-opacity duration-200 ${!sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <PanelRightOpen />
        </button>
        <div className="flex items-center gap-2">
          {isLoadingFiles && (
            <div className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
              {loadingProgress && (
                <span className="text-xs text-gray-400">{loadingProgress}</span>
              )}
            </div>
          )}
          <button
            onClick={() => setIsCreatingFile(true)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Create new file"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isCreatingFile && (
        <div className="p-2">
          <Input
            autoFocus
            value={newFileName}
            spellCheck={false}
            onChange={(e) => {
              setNewFileName(e.target.value)
              if (errorMessage) {
                setErrorMessage("")
              }
            }}
            onBlur={handleCreateFileBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCreateFileInline()
              } else if (e.key === "Escape") {
                e.preventDefault()
                setIsCreatingFile(false)
                setNewFileName("")
                setErrorMessage("")
                setSelectedFolderForCreation(null)
              } else if (e.key === "Tab") {
                e.preventDefault()
                const currentFolder = getCurrentFolderPath()
                if (currentFolder && !newFileName.includes("/")) {
                  const displayPath = currentFolder.startsWith("/")
                    ? currentFolder.slice(1)
                    : currentFolder
                  setNewFileName(`${displayPath}/`)
                }
              }
            }}
            placeholder={(() => {
              const currentFolder = getCurrentFolderPath()
              if (!currentFolder || currentFolder === "/") {
                return "Enter file name (root folder)"
              }
              const displayPath = currentFolder.startsWith("/")
                ? currentFolder.slice(1)
                : currentFolder
              return `Enter file name (${displayPath}/)`
            })()}
            className={
              errorMessage ? "border-red-500 focus:border-red-500" : ""
            }
          />
          {errorMessage && (
            <div className="text-red-500 text-xs mt-1 px-1">{errorMessage}</div>
          )}
          <div className="text-gray-400 text-xs mt-1 px-1">
            Tip: Use / for subfolders, Tab to auto-complete current folder
          </div>
        </div>
      )}
      <div className="flex-1 border-t h-full">
        <TreeView
          data={treeData}
          setSelectedItemId={(value) => {
            if (value && files[value]) {
              onFileSelect(value)
            }
          }}
          selectedItemId={selectedItemId}
          onSelectChange={(item) => {
            if (item?.onClick) {
              item.onClick()
            }
          }}
        />
      </div>
    </div>
  )
}

export default FileSidebar
