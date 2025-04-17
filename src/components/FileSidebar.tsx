import React from "react"
import { cn } from "@/lib/utils"
import { File, Folder } from "lucide-react"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"

type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName
  onFileSelect: (filename: FileName) => void
  className?: string
}

const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
}) => {
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
    <div className={cn("flex-shrink-0", className)}>
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
