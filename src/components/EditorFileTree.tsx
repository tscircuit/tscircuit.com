import React, { useCallback, useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  File,
  Folder,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GripVertical,
  FileJson,
  FileCode,
  FileText,
} from "lucide-react"

// File type icon mapping
const FILE_ICONS: Record<string, React.ReactNode> = {
  ".json": <FileJson className="flex-shrink-0 w-4 h-4 text-yellow-500" />,
  ".js": <FileCode className="flex-shrink-0 w-4 h-4 text-yellow-400" />,
  ".jsx": <FileCode className="flex-shrink-0 w-4 h-4 text-blue-400" />,
  ".ts": <FileCode className="flex-shrink-0 w-4 h-4 text-blue-600" />,
  ".tsx": <FileCode className="flex-shrink-0 w-4 h-4 text-blue-500" />,
  ".md": <FileText className="flex-shrink-0 w-4 h-4 text-gray-500" />,
  ".txt": <FileText className="flex-shrink-0 w-4 h-4 text-gray-400" />,
}

// Get file icon based on extension
function getFileIcon(filename: string) {
  const extension = filename.substring(filename.lastIndexOf("."))
  return (
    FILE_ICONS[extension] || (
      <File className="flex-shrink-0 w-4 h-4 text-gray-400" />
    )
  )
}

interface EditorFileTreeProps {
  files: Record<string, string>
  currentFile: string
  onFileSelect: (filename: string) => void
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

interface FileTreeNode {
  name: string
  path: string
  type: "file" | "directory"
  children?: FileTreeNode[]
}

function buildFileTree(files: Record<string, string>): FileTreeNode[] {
  const root: FileTreeNode[] = []

  Object.keys(files).forEach((path) => {
    const parts = path.split("/")
    let current = root

    parts.forEach((part, index) => {
      if (!part) return

      const isFile = index === parts.length - 1
      const currentPath = parts.slice(0, index + 1).join("/")

      let node = current.find((n) => n.name === part)

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "directory",
          children: isFile ? undefined : [],
        }
        current.push(node)
      }

      if (!isFile) {
        current = node.children!
      }
    })
  })

  return root
}

function FileTreeNode({
  node,
  level = 0,
  currentFile,
  onFileSelect,
  containerWidth = 256,
}: {
  node: FileTreeNode
  level?: number
  currentFile: string
  onFileSelect: (path: string) => void
  containerWidth?: number
}) {
  const [isOpen, setIsOpen] = React.useState(true)
  const isSelected = node.path === currentFile
  const isDirectory = node.type === "directory"

  // Calculate padding based on container width
  const basePadding = Math.min(12, Math.max(4, containerWidth / 20))
  const levelPadding = level * basePadding

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 text-sm rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isSelected
            ? "bg-blue-100 text-blue-700 font-medium hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
            : "text-gray-700 dark:text-gray-300",
          isDirectory ? "cursor-pointer" : "cursor-pointer",
        )}
        style={{
          paddingLeft: `${levelPadding + 8}px`,
          paddingRight: "4px",
        }}
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen)
          } else {
            onFileSelect(node.path)
          }
        }}
        onDoubleClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen)
          }
        }}
      >
        <div className="flex-shrink-0 w-4 flex justify-center">
          {isDirectory ? (
            isOpen ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )
          ) : null}
        </div>
        {isDirectory ? (
          <Folder
            className={cn(
              "flex-shrink-0 w-4 h-4",
              isOpen ? "text-blue-500" : "text-gray-400",
            )}
          />
        ) : (
          getFileIcon(node.name)
        )}
        <span className="truncate text-ellipsis overflow-hidden">
          {node.name}
        </span>
      </div>

      {isDirectory && isOpen && (
        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            isOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden",
          )}
        >
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              currentFile={currentFile}
              onFileSelect={onFileSelect}
              containerWidth={containerWidth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Local storage key
const WIDTH_STORAGE_KEY = "editor-file-tree-width"

export function EditorFileTree({
  files,
  currentFile,
  onFileSelect,
  className,
  collapsed = false,
  onToggleCollapse = () => {},
}: EditorFileTreeProps) {
  const fileTree = React.useMemo(() => buildFileTree(files), [files])
  // Initialize width from localStorage or default to 256px
  const [width, setWidth] = React.useState(() => {
    try {
      const savedWidth = localStorage.getItem(WIDTH_STORAGE_KEY)
      return savedWidth
        ? Math.max(180, Math.min(500, parseInt(savedWidth)))
        : 256
    } catch (e) {
      return 256
    }
  })
  const resizingRef = useRef(false)
  const initialXRef = useRef(0)
  const initialWidthRef = useRef(0)

  // Save width to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(WIDTH_STORAGE_KEY, width.toString())
    } catch (e) {
      console.error("Failed to save file tree width to localStorage", e)
    }
  }, [width])

  const handleResizeStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      resizingRef.current = true
      initialXRef.current = e.clientX
      initialWidthRef.current = width
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      const handleMouseMove = (e: MouseEvent) => {
        if (resizingRef.current) {
          const deltaX = e.clientX - initialXRef.current
          const newWidth = Math.max(
            180,
            Math.min(500, initialWidthRef.current + deltaX),
          )
          setWidth(newWidth)
        }
      }

      const handleMouseUp = () => {
        resizingRef.current = false
        document.body.style.removeProperty("cursor")
        document.body.style.removeProperty("user-select")
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [width],
  )

  return (
    <div
      className={cn(
        "border-r bg-white dark:bg-gray-900 dark:border-gray-800 transition-all duration-200 ease-in-out flex flex-col h-full shadow-sm relative",
        collapsed ? "w-10" : "",
        !collapsed && "transition-none", // Disable transition when not collapsed for smooth resize
        className,
      )}
      style={{ width: collapsed ? "40px" : `${width}px` }}
    >
      <div
        className={cn(
          "flex justify-center p-2 border-b cursor-pointer transition-colors shrink-0",
          "dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800",
          collapsed ? "py-3" : "",
        )}
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <span className="font-medium text-xs text-gray-500 uppercase tracking-wider truncate">
              Files
            </span>
            <ChevronLeft className="flex-shrink-0 w-4 h-4 text-gray-500" />
          </div>
        )}
      </div>
      {!collapsed && (
        <>
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-10 group hover:bg-blue-400 bg-gray-100"
            onMouseDown={handleResizeStart}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute right-0 h-8 w-4 bg-blue-400 rounded-l flex items-center justify-center top-1/2 -translate-y-1/2 -translate-x-1/2">
              <GripVertical className="h-4 w-4 text-white" />
            </div>
          </div>
          <ScrollArea className="h-full overflow-x-hidden">
            <div className="p-2">
              {fileTree.map((node) => (
                <FileTreeNode
                  key={node.path}
                  node={node}
                  currentFile={currentFile}
                  onFileSelect={onFileSelect}
                  containerWidth={width}
                />
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  )
}
