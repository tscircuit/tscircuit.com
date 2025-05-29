import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { File, Folder, MoreVertical, PanelRightOpen, Plus } from "lucide-react"
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
} from "@/hooks/useFileManagement"
import { useToast } from "@/hooks/use-toast"
type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName | null
  onFileSelect: (filename: FileName) => void
  className?: string
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleCreateFile: (props: ICreateFileProps) => ICreateFileResult
  handleDeleteFile: (props: IDeleteFileProps) => IDeleteFileResult
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
  fileSidebarState,
  handleCreateFile,
  handleDeleteFile,
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [newFileName, setNewFileName] = useState("")
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { toast } = useToast()

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
            id: relativePath,
            name: isLeafNode ? segment : segment,
            icon: isLeafNode ? File : Folder,
            onClick: isLeafNode ? () => onFileSelect(absolutePath) : undefined,
            draggable: false,
            droppable: !isLeafNode,
            children: isLeafNode ? undefined : {},
            actions: (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <MoreVertical className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md border border-gray-200">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          const { fileDeleted } = handleDeleteFile({
                            filename: relativePath,
                            onError: (error) => {
                              toast({
                                title: `Error deleting file ${relativePath}`,
                                description: error.message,
                              })
                            },
                          })
                          if (fileDeleted) {
                            setErrorMessage("")
                          }
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ),
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

  const treeData = transformFilesToTreeData(files)
  // console.log("treeData", files)
  const handleCreateFileInline = () => {
    const { newFileCreated } = handleCreateFile({
      newFileName,
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
      {isCreatingFile && (
        <div className="p-2">
          <Input
            autoFocus
            value={newFileName}
            spellCheck={false}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={handleCreateFileInline}
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
          />
          {errorMessage && (
            <div className="text-red-500 mt-1">{errorMessage}</div>
          )}
        </div>
      )}
      <TreeView
        data={treeData}
        initialSelectedItemId={currentFile || ""}
        onSelectChange={(item) => {
          if (item?.onClick) {
            item.onClick()
          }
        }}
      />
    </div>
  )
}

export default FileSidebar
