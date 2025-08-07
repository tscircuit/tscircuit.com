import type { TreeDataItem } from "@/components/ui/tree-view"
import type {
  IRenameFileProps,
  IDeleteFileProps,
} from "@/hooks/useFileManagement"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import { File, Folder, MoreVertical, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

type FileName = string

interface TransformFilesToTreeDataProps {
  files: Record<FileName, string>
  currentFile: FileName | null
  renamingFile: string | null
  handleRenameFile: (props: IRenameFileProps) => { fileRenamed: boolean }
  handleDeleteFile: (props: IDeleteFileProps) => { fileDeleted: boolean }
  setRenamingFile: (filename: string | null) => void
  onFileSelect: (filename: FileName) => void
  onFolderSelect: (folderPath: string) => void
  canModifyFiles: boolean
  setErrorMessage: (message: string) => void
  setSelectedFolderForCreation: (folder: string | null) => void
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
}: TransformFilesToTreeDataProps): TreeDataItem[] => {
  const { toast } = useToast()
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

  const convertToArray = (items: Record<string, TreeNode>): TreeDataItem[] => {
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
