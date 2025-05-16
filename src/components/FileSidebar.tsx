import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { File, Folder, PanelRightOpen, Plus } from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { isHiddenFile } from "./ViewPackagePage/utils/is-hidden-file"
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

type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName
  onFileSelect: (filename: FileName) => void
  className?: string
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleCreateFile: (
    newFileName: string,
    newFileContent: string,
    setErrorMessage: (message: string) => void,
    setIsModalOpen: (isOpen: boolean) => void,
    onFileSelect: (fileName: string) => void,
    setNewFileName: (fileName: string) => void,
  ) => void
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileContent, setNewFileContent] = useState("")
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

  const isValidFileName = (name: string) => {
    // Basic checks for file naming conventions
    const invalidChars = /[<>:"/\\|?*]/
    return name.length > 0 && !invalidChars.test(name)
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
        onClick={() => setIsModalOpen(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <Plus className="w-5 h-5" />
      </button>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogClose />
          <DialogTitle className="text-lg font-medium text-center">
            Create New File
          </DialogTitle>
          <DialogDescription className="text-sm text-center text-gray-500">
            Enter the name and content for the new file you wish to create.
          </DialogDescription>
          <Input
            spellCheck={false}
            autoComplete="off"
            placeholder="File Name"
            value={newFileName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewFileName(e.target.value.trim())
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateFile(
                  newFileName,
                  newFileContent,
                  setErrorMessage,
                  setIsModalOpen,
                  onFileSelect,
                  setNewFileName,
                )
              }
            }}
          />
          <Button
            onClick={() =>
              handleCreateFile(
                newFileName,
                newFileContent,
                setErrorMessage,
                setIsModalOpen,
                onFileSelect,
                setNewFileName,
              )
            }
          >
            Create
          </Button>
          {errorMessage && (
            <p className="text-red-500 text-md font-bold text-center break-all">
              {errorMessage}
            </p>
          )}
        </DialogContent>
      </Dialog>
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
