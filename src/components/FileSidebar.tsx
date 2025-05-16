import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { File, Folder, PanelRightOpen, Plus } from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { isHiddenFile } from "./ViewPackagePage/utils/is-hidden-file"
import { useCreateFileDialog } from "./dialogs/create-file-dialog"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateFileProps } from "./package-port/CodeAndPreview"

type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName
  onFileSelect: (filename: FileName) => void
  className?: string
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleCreateFile: (props: CreateFileProps) => void
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
  fileSidebarState,
  handleCreateFile,
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [newFileName, setNewFileName] = useState("")
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const transformFilesToTreeData = (
    files: Record<FileName, string>,
  ): TreeDataItem[] => {
    type TreeNode = Omit<TreeDataItem, "children"> & {
      children?: Record<string, TreeNode>
    }
    const root: Record<string, TreeNode> = {}

    Object.keys(files).forEach((path) => {
      const startsWithSlash = path.startsWith("/")
      const parts = (startsWithSlash ? path.slice(1) : path).trim().split("/")
      let current = root

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        const parentPath = parts.slice(0, index).join("/")
        const currentPath = parentPath ? `${parentPath}/${part}` : part
        const evaluatedFilePath = startsWithSlash
          ? `/${currentPath}`
          : currentPath
        if (
          !current[part] &&
          (!isHiddenFile(currentPath) ||
            isHiddenFile(
              currentFile.startsWith("/") ? currentFile.slice(1) : currentFile,
            ))
        ) {
          current[part] = {
            id: currentPath,
            name: isFile ? part : part,
            icon: isFile ? File : Folder,
            onClick: isFile ? () => onFileSelect(evaluatedFilePath) : undefined,
            draggable: isFile,
            droppable: !isFile,
            children: isFile ? undefined : {},
          }
        }

        if (!isFile && current[part].children) {
          current = current[part].children
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

  const handleCreateFileInline = () => {
    handleCreateFile({
      newFileName,
      setErrorMessage,
      onFileSelect,
      setNewFileName,
      setIsCreatingFile,
    })
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
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`z-[99] mt-2 ml-2 text-gray-400 scale-90 transition-opacity duration-200 ${
          !sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <PanelRightOpen />
      </button>
      <button
        onClick={() => setIsCreatingFile(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <Plus className="w-5 h-5" />
      </button>
      {isCreatingFile && (
        <div className="p-2">
          <Input
            autoFocus
            value={newFileName}
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
        initialSelectedItemId={currentFile}
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
