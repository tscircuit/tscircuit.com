import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  File,
  Folder,
  MoreVertical,
  PanelRightOpen,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { isHiddenFile } from "./ViewPackagePage/utils/is-hidden-file"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import type {
  ICreateFileProps,
  ICreateFileResult,
  IDeleteFileProps,
  IDeleteFileResult,
  IRenameFileProps,
  IRenameFileResult,
} from "@/hooks/useFileManagement"
import { useToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
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
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [newFileName, setNewFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [selectedFolderForCreation, setSelectedFolderForCreation] = useState<
    string | null
  >(null)
  const [selectedItemId, setSelectedItemId] = React.useState<string>(
    currentFile || "",
  )
  const { toast } = useToast()
  const canModifyFiles = true

  const onFolderSelect = (folderPath: string) => {
    setSelectedFolderForCreation(folderPath)
  }

  const transformFilesToTreeData = (
    files: Record<FileName, string>,
  ): TreeDataItem[] => {
    type TreeNode = Omit<TreeDataItem, "children"> & {
      children?: Record<string, TreeNode>
    }
    const root: Record<string, TreeNode> = {}

    Object.keys(files).forEach((filePath) => {
      const hasLeadingSlash = filePath.startsWith("/")
      const pathSegments = (hasLeadingSlash ? filePath.slice(1) : filePath)
        .trim()
        .split("/")
      let currentNode: Record<string, TreeNode> = root

      pathSegments.forEach((segment, segmentIndex) => {
        const isLeafNode = segmentIndex === pathSegments.length - 1
        const ancestorPath = pathSegments.slice(0, segmentIndex).join("/")
        const relativePath = ancestorPath
          ? `${ancestorPath}/${segment}`
          : segment
        const absolutePath = hasLeadingSlash ? `/${relativePath}` : relativePath
        const itemId = absolutePath

        if (
          !currentNode[segment] &&
          (!isHiddenFile(relativePath) ||
            isHiddenFile(
              currentFile?.startsWith("/")
                ? currentFile.slice(1)
                : currentFile || "",
            ))
        ) {
          currentNode[segment] = {
            id: itemId,
            name: segment,
            isRenaming: renamingFile === itemId,
            onRename: (newFilename: string) => {
              const oldPath = itemId
              const pathParts = oldPath.split("/").filter((part) => part !== "")
              let newPath: string

              if (pathParts.length > 1) {
                const folderPath = pathParts.slice(0, -1).join("/")
                newPath = folderPath + "/" + newFilename
              } else {
                newPath = newFilename
              }

              if (oldPath.startsWith("/") && !newPath.startsWith("/")) {
                newPath = "/" + newPath
              }

              const { fileRenamed } = handleRenameFile({
                oldFilename: itemId,
                newFilename: newPath,
                onError: (error) => {
                  toast({
                    title: `Error renaming file`,
                    description: error.message,
                    variant: "destructive",
                  })
                },
              })
              if (fileRenamed) {
                setRenamingFile(null)
              }
            },
            onCancelRename: () => {
              setRenamingFile(null)
            },
            icon: isLeafNode ? File : Folder,
            onClick: isLeafNode
              ? () => {
                  onFileSelect(absolutePath)
                  setSelectedFolderForCreation(null)
                }
              : () => onFolderSelect(absolutePath),
            draggable: false,
            droppable: !isLeafNode,
            children: isLeafNode ? undefined : {},
            actions: canModifyFiles ? (
              <>
                <DropdownMenu key={itemId}>
                  <DropdownMenuTrigger asChild>
                    <MoreVertical className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-fit bg-white shadow-lg rounded-md border-4 z-[100] border-white"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      marginTop: "0.5rem",
                      width: "8rem",
                      padding: "0.01rem",
                    }}
                  >
                    <DropdownMenuGroup>
                      {isLeafNode && (
                        <DropdownMenuItem
                          onClick={() => {
                            setRenamingFile(itemId)
                          }}
                          className="flex items-center px-3 py-1 text-xs text-black hover:bg-gray-100 cursor-pointer"
                        >
                          <Pencil className="mr-2 h-3 w-3" />
                          Rename
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          const { fileDeleted } = handleDeleteFile({
                            filename: itemId,
                            onError: (error) => {
                              toast({
                                title: `Error deleting file ${itemId}`,
                                description: error.message,
                              })
                            },
                          })
                          if (fileDeleted) {
                            setErrorMessage("")
                          }
                        }}
                        className="flex items-center px-3 py-1 text-xs text-red-600 hover:bg-gray-100 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : undefined,
          }
        }

        if (!isLeafNode && currentNode[segment].children) {
          currentNode = currentNode[segment].children
        }
      })
    })

    const convertToArray = (
      items: Record<string, TreeNode>,
    ): TreeDataItem[] => {
      return Object.values(items).map((item) => ({
        ...item,
        children: item.children ? convertToArray(item.children) : undefined,
      }))
    }
    return convertToArray(root).filter((x) => {
      if (x.children?.length === 0) return false
      return true
    })
  }

  const treeData = transformFilesToTreeData(files)

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
      setSelectedItemId(finalFileName)
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
      <button
        onClick={toggleSidebar}
        className={`z-[99] mt-2 ml-2 text-gray-400 scale-90 transition-opacity duration-200 ${!sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <PanelRightOpen />
      </button>
      <button
        onClick={() => setIsCreatingFile(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Create new file"
      >
        <Plus className="w-5 h-5" />
      </button>
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
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedFolderForCreation(null)
            setSelectedItemId("")
          }
        }}
        className="flex-1 border-2 h-full"
      >
        <TreeView
          data={treeData}
          setSelectedItemId={(value) => setSelectedItemId(value || "")}
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
