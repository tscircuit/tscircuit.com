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
  pkg,
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [newFileName, setNewFileName] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<TreeDataItem | undefined>()
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)
  const canModifyFiles = true

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
              // Preserve the folder structure when renaming
              const oldPath = itemId
              const pathParts = oldPath.split("/").filter((part) => part !== "") // Remove empty segments
              let newPath: string

              if (pathParts.length > 1) {
                // File is in a folder, preserve the folder structure
                const folderPath = pathParts.slice(0, -1).join("/")
                newPath = folderPath + "/" + newFilename
              } else {
                // File is in root, just use the new filename
                newPath = newFilename
              }

              // Preserve leading slash if original path had one
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
            onClick: isLeafNode ? () => onFileSelect(absolutePath) : undefined,
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

    // Convert the nested object structure to array structure
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

  const addInputNode = (
    items: TreeDataItem[],
    folderId: string,
    node: TreeDataItem,
  ): TreeDataItem[] => {
    return items.map((item) => {
      if (item.id === folderId) {
        const children = item.children ? [...item.children, node] : [node]
        return { ...item, children }
      }
      if (item.children) {
        return {
          ...item,
          children: addInputNode(item.children, folderId, node),
        }
      }
      return item
    })
  }

  const treeData = transformFilesToTreeData(files)
  const treeDataWithInput = React.useMemo(() => {
    if (!isCreatingFile) return treeData
    const inputNode: TreeDataItem = {
      id: "__new_file__",
      name: (
        <Input
          autoFocus
          value={newFileName}
          spellCheck={false}
          onChange={(e) => setNewFileName(e.target.value)}
          onBlur={handleCreateFileBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateFileInline()
            } else if (e.key === "Escape") {
              setIsCreatingFile(false)
              setNewFileName("")
              setErrorMessage("")
            }
          }}
          placeholder="Enter file name"
          className="h-6 px-2 py-0 text-sm flex-1 mr-8 bg-white border-blue-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
      ),
      icon: File,
    }
    if (selectedItem && !selectedItem.onClick) {
      return addInputNode(treeData, selectedItem.id, inputNode)
    }
    return [...treeData, inputNode]
  }, [isCreatingFile, selectedItem, newFileName, treeData])

  const handleCreateFileInline = () => {
    let fullPath = newFileName.trim()
    if (selectedItem && !selectedItem.onClick) {
      const base = selectedItem.id.replace(/\/$/, "")
      fullPath = base ? `${base}/${fullPath}` : fullPath
    }
    const { newFileCreated } = handleCreateFile({
      newFileName: fullPath,
      onError: (error) => {
        setErrorMessage(error.message)
      },
    })
    if (newFileCreated) {
      setIsCreatingFile(false)
      setNewFileName("")
      setErrorMessage("")
    }
  }

  const handleCreateFileBlur = () => {
    if (newFileName.trim() === "") {
      setIsCreatingFile(false)
      setNewFileName("")
      setErrorMessage("")
      return
    }
    handleCreateFileInline()
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    setErrorMessage("")
    setIsCreatingFile(false)
    setNewFileName("")
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
        className={`z-[99] mt-2 ml-2 text-gray-400 scale-90 transition-opacity duration-200 ${
          !sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
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
      {errorMessage && isCreatingFile && (
        <div className="text-red-500 mt-1 px-2">{errorMessage}</div>
      )}
      <TreeView
        data={treeDataWithInput}
        initialSelectedItemId={currentFile || ""}
        onSelectChange={(item) => {
          setSelectedItem(item)
          if (item?.onClick) {
            item.onClick()
          }
        }}
      />
    </div>
  )
}

export default FileSidebar
