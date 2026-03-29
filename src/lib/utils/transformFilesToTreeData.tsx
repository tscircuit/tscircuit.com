import React from "react"
import { cn } from "@/lib/utils"
import type { TreeDataItem } from "@/components/ui/tree-view"
import type {
  IRenameFileProps,
  IDeleteFileProps,
} from "@/hooks/useFileManagement"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import {
  File,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  FileCode,
  FileJson,
  FileText,
  Settings2,
  Braces,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

type FileName = string
type TreeNode = Omit<TreeDataItem, "children"> & {
  children?: Record<string, TreeNode>
}

const getFileIcon = (fileName: string) => {
  if (fileName === "package.json")
    return (props: any) => (
      <Settings2 {...props} className={cn(props.className, "text-gray-500")} />
    )
  if (
    fileName.endsWith(".tsx") ||
    fileName.endsWith(".ts") ||
    fileName.endsWith(".jsx") ||
    fileName.endsWith(".js")
  )
    return (props: any) => (
      <FileCode {...props} className={cn(props.className, "text-blue-500")} />
    )
  if (fileName.endsWith(".json"))
    return (props: any) => (
      <Braces {...props} className={cn(props.className, "text-yellow-500")} />
    )
  if (fileName.endsWith(".md"))
    return (props: any) => (
      <FileText {...props} className={cn(props.className, "text-gray-500")} />
    )
  if (fileName.endsWith(".css"))
    return (props: any) => (
      <FileCode {...props} className={cn(props.className, "text-blue-500")} />
    )
  return (props: any) => (
    <File {...props} className={cn(props.className, "text-gray-500")} />
  )
}

const FolderIcon = (props: any) => (
  <Folder {...props} className={cn(props.className, "text-gray-600")} />
)
interface TransformFilesToTreeDataProps {
  files: Record<FileName, string>
  currentFile: FileName | null
  renamingFile: string | null
  handleRenameFile: (props: IRenameFileProps) => { fileRenamed: boolean }
  handleDeleteFile: (props: IDeleteFileProps) => { deleted: boolean }
  setRenamingFile: (filename: string | null) => void
  onFileSelect: (filename: FileName) => void
  onFolderSelect: (folderPath: string) => void
  canModifyFiles: boolean
  setErrorMessage: (message: string) => void
  setSelectedFolderForCreation: React.Dispatch<
    React.SetStateAction<string | null>
  >
  openDropdownId: string | null
  setOpenDropdownId: (id: string | null) => void
  preservedDirectories: Set<string>
}

export const transformFilesToTreeData = ({
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
  openDropdownId,
  setOpenDropdownId,
  preservedDirectories,
}: TransformFilesToTreeDataProps): TreeDataItem[] => {
  const { toast } = useToast()

  const createDirectoryActions = (itemId: string) =>
    canModifyFiles ? (
      <>
        <DropdownMenu
          key={itemId}
          open={openDropdownId === itemId}
          onOpenChange={(open) => {
            setOpenDropdownId(open ? itemId : null)
          }}
        >
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
              <DropdownMenuItem
                onClick={() => {
                  const { deleted } = handleDeleteFile({
                    filename: itemId,
                    onError: (error) => {
                      toast({
                        title: `Error deleting ${itemId}`,
                        description: error.message,
                      })
                    },
                  })
                  if (deleted) {
                    setErrorMessage("")
                    setSelectedFolderForCreation((prev: string | null) => {
                      if (!prev) return null
                      if (prev === itemId || prev.startsWith(itemId + "/")) {
                        return null
                      }
                      return prev
                    })
                  }
                  setOpenDropdownId(null)
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
    ) : undefined

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
      const relativePath = ancestorPath ? `${ancestorPath}/${segment}` : segment
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
              pathParts[pathParts.length - 1] = newFilename
              newPath = pathParts.join("/")
            } else {
              newPath = newFilename
            }

            const { fileRenamed } = handleRenameFile({
              oldFilename: oldPath,
              newFilename: newPath,
              onError: (error) => {
                toast({
                  title: `Error renaming ${oldPath}`,
                  description: error.message,
                })
              },
            })
            if (fileRenamed) {
              setRenamingFile(null)
            }
          },
          onCancelRename: () => setRenamingFile(null),
          icon: isLeafNode ? getFileIcon(segment) : FolderIcon,
          onClick: isLeafNode
            ? () => {
                onFileSelect(itemId)
                setSelectedFolderForCreation(null)
              }
            : () => onFolderSelect(itemId),
          draggable: false,
          droppable: !isLeafNode,
          children: isLeafNode ? undefined : {},
          actions: canModifyFiles ? (
            <>
              <DropdownMenu
                key={itemId}
                open={openDropdownId === itemId}
                onOpenChange={(open) => {
                  setOpenDropdownId(open ? itemId : null)
                }}
              >
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
                          setOpenDropdownId(null)
                        }}
                        className="flex items-center px-3 py-1 text-xs text-black hover:bg-gray-100 cursor-pointer"
                      >
                        <Pencil className="mr-2 h-3 w-3" />
                        Rename
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        const { deleted } = handleDeleteFile({
                          filename: itemId,
                          onError: (error) => {
                            toast({
                              title: `Error deleting file ${itemId}`,
                              description: error.message,
                            })
                          },
                        })
                        if (deleted) {
                          setErrorMessage("")
                          setSelectedFolderForCreation((prev: string | null) => {
                            if (!prev) return null
                            if (prev === itemId || prev.startsWith(itemId + "/")) {
                              return null
                            }
                            return prev
                          })
                        }
                        setOpenDropdownId(null)
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
          onContextMenu: canModifyFiles
            ? (e: React.MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              setOpenDropdownId(itemId)
            }
            : undefined,
        }
      }

      if (!isLeafNode && currentNode[segment]?.children) {
        currentNode = currentNode[segment].children
      }
    })
  })

  if (preservedDirectories && preservedDirectories.size > 0) {
    for (const dirPath of preservedDirectories) {
      const hasLeadingSlash = dirPath.startsWith("/")
      const pathSegments = (hasLeadingSlash ? dirPath.slice(1) : dirPath)
        .trim()
        .split("/")
        .filter(Boolean)

      let currentNode = root

      pathSegments.forEach((segment: string, segmentIndex: number) => {
        const ancestorPath = pathSegments.slice(0, segmentIndex).join("/")
        const relativePath = ancestorPath
          ? `${ancestorPath}/${segment}`
          : segment
        const absolutePath = hasLeadingSlash
          ? `/${relativePath}`
          : relativePath

        if (!currentNode[segment]) {
          currentNode[segment] = {
            id: absolutePath,
            name: segment,
            isRenaming: false,
            onRename: () => { },
            onCancelRename: () => { },
            icon: FolderIcon,
            onClick: () => onFolderSelect(absolutePath),
            draggable: false,
            droppable: true,
            children: {},
            actions: createDirectoryActions(absolutePath),
            onContextMenu: canModifyFiles
              ? (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                setOpenDropdownId(absolutePath)
              }
              : undefined,
          }
        }

        if (currentNode[segment]?.children) {
          currentNode = currentNode[segment].children as Record<
            string,
            TreeNode
          >
        }
      })
    }
  }

  const convertToArray = (items: Record<string, TreeNode>): TreeDataItem[] => {
    return Object.values(items)
      .map((item) => ({
        ...item,
        children: item.children ? convertToArray(item.children) : undefined,
      }))
      .filter((item) => {
        if (!item.children) return true
        if (preservedDirectories?.has(item.id)) return true
        return item.children.length > 0
      })
  }

  return convertToArray(root)
}
