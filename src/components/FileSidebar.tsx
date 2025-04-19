import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { File, Folder, PanelRightOpen } from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { isHiddenFile } from "./ViewPackagePage/utils/is-hidden-file"

type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName
  onFileSelect: (filename: FileName) => void
  className?: string
  fileSidebarState: ReturnType<typeof useState<boolean>>
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
  fileSidebarState,
}) => {
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
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
        if (!current[part] && !isHiddenFile(currentPath)) {
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
        className={`z-[99] mt-2 ml-2 text-gray-400 scale-90 transition-opacity duration-200 ${!sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <PanelRightOpen />
      </button>
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
