import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  File,
  Folder,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

type FileName = string

interface FileSidebarProps {
  files: Record<FileName, string>
  currentFile: FileName
  onFileSelect: (filename: FileName) => void
  className?: string
}

interface FileTreeNode {
  name: string
  type: "file" | "folder"
  children?: Record<string, FileTreeNode>
}

const buildFileTree = (files: Record<string, string>): FileTreeNode => {
  const root: FileTreeNode = { name: "", type: "folder", children: {} }

  Object.keys(files).forEach((path) => {
    const parts = path.split("/")
    let current = root

    parts.forEach((part, index) => {
      if (!current.children) current.children = {}

      if (index === parts.length - 1) {
        // It's a file
        current.children[part] = { name: part, type: "file" }
      } else {
        // It's a directory
        if (!current.children[part]) {
          current.children[part] = { name: part, type: "folder", children: {} }
        }
        current = current.children[part]
      }
    })
  })

  return root
}

const FileTreeItem: React.FC<{
  node: FileTreeNode
  path: string
  level: number
  currentFile: string
  onFileSelect: (path: string) => void
}> = ({ node, path, level, currentFile, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(level < 1)
  const fullPath = path ? `${path}/${node.name}` : node.name

  if (node.type === "file") {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-2 py-1.5 h-auto text-xs font-normal rounded-sm transition-all duration-200",
          "hover:bg-blue-50/80 dark:hover:bg-gray-800/80",
          currentFile === fullPath &&
            "bg-blue-100/90 dark:bg-gray-800/90 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500",
        )}
        style={{ minHeight: 32, marginLeft: level * 12 }}
        onClick={() => onFileSelect(fullPath)}
      >
        <div className="flex items-center gap-1.5 w-full">
          <File className="h-3.5 w-3.5 text-blue-600/80" />
          <span className="truncate flex-1 text-left text-gray-700 dark:text-gray-300">
            {node.name}
          </span>
        </div>
      </Button>
    )
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-2 py-1.5 h-auto text-xs font-medium rounded-sm transition-all duration-200",
          "hover:bg-blue-50/80 dark:hover:bg-gray-800/80",
          isExpanded &&
            "bg-blue-50/90 dark:bg-gray-800/90 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500",
        )}
        style={{ minHeight: 32, marginLeft: level * 12 }}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-1.5 w-full">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          )}
          <Folder className="h-3.5 w-3.5 text-yellow-500/90" />
          <span className="truncate flex-1 text-left text-gray-700 dark:text-gray-300">
            {node.name}
          </span>
        </div>
      </Button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {isExpanded && node.children && (
          <div className="py-0.5">
            {Object.values(node.children)
              .sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name)
                return a.type === "folder" ? -1 : 1
              })
              .map((child) => (
                <FileTreeItem
                  key={child.name}
                  node={child}
                  path={fullPath}
                  level={level + 1}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const FileSidebar: React.FC<FileSidebarProps> = ({
  files,
  currentFile,
  onFileSelect,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(256) // Default width
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const fileTree = buildFileTree(files)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const newWidth = e.clientX
      if (newWidth >= 180 && newWidth <= 480) {
        // Min and max width
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.cursor = "default"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div
      ref={sidebarRef}
      style={{
        width: collapsed ? 48 : width,
        transform: collapsed ? "translateX(0)" : "translateX(0)",
      }}
      className={cn(
        "select-none relative transition-all duration-300 ease-in-out overflow-hidden",
        "border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 min-h-screen md:min-h-0",
        className,
      )}
    >
      <Button
        variant="ghost"
        className="absolute !z-[999] right-2 top-2 p-1.5 h-7 w-7 min-w-0 min-h-0 flex items-center justify-center shadow-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5 text-blue-700" />
        ) : (
          <ChevronLeft
            width={50}
            height={50}
            className="h-5 w-5 text-blue-700"
          />
        )}
      </Button>
      {!collapsed && (
        <div
          ref={resizeRef}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-10"
          style={{ cursor: isDraggingRef.current ? "col-resize" : undefined }}
          onMouseDown={(e) => {
            isDraggingRef.current = true
            document.body.style.cursor = "col-resize"
          }}
        />
      )}
      {!collapsed && (
        <ScrollArea className="h-full">
          <div className="p-2 space-y-0.5">
            {Object.values(fileTree.children || {}).map((node) => (
              <FileTreeItem
                key={node.name}
                node={node}
                path=""
                level={0}
                currentFile={currentFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
