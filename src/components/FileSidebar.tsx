import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { File, Folder, PanelRightOpen } from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"

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
    const root: { [key: string]: TreeDataItem } = {}

    Object.keys(files).forEach((path) => {
      const parts = path.split("/")
      let current = root

      let currentPath = ""
      parts.forEach((part, index) => {
        const id = currentPath ? `${currentPath}/${part}` : part
        currentPath = id

        if (!current[part]) {
          const isFile = index === parts.length - 1
          current[part] = {
            id: id,
            name: part,
            icon: isFile ? File : Folder,
            onClick: isFile ? () => onFileSelect(id) : undefined,
          }
        }
        current = (current[part] as any).children || (current[part] as any)
      })
    })

    return Object.values(root)
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
        className={`z-[99] mt-2 ml-2 text-black/60 scale-90 transition-opacity duration-200 ${!sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
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
