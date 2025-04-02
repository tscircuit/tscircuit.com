"use client"

import { FileText, Folder } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { isWithinDirectory } from "../../utils/is-within-directory"
import { useState, useMemo } from "react"

interface Directory {
  type: "directory"
  path: string
  name: string
}

interface File {
  type: "file"
  path: string
  name: string
  content: string
  created_at: string
}

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  file_content: string
  content_text?: string // Keep for backward compatibility
  created_at: string // iso-8601
}

interface FilesViewProps {
  packageFiles?: PackageFile[]
  isLoading?: boolean
  onFileClicked?: (file: PackageFile) => void
}

export default function FilesView({
  packageFiles = [],
  isLoading = false,
  onFileClicked,
}: FilesViewProps) {
  const [activeDir, setActiveDir] = useState("")

  // Parse package files to determine directories and files structure
  const { directories, files } = useMemo(() => {
    if (!packageFiles.length) {
      return { directories: [], files: [] }
    }

    const dirs = new Set<string>()
    const filesList: File[] = []

    packageFiles.forEach((file) => {
      // Extract directory path
      const pathParts = file.file_path.split("/")
      const fileName = pathParts.pop() || ""

      // Add all parent directories
      let currentPath = ""
      pathParts.forEach((part) => {
        currentPath += (currentPath ? "/" : "") + part
        dirs.add(currentPath)
      })

      filesList.push({
        type: "file",
        path: file.file_path,
        name: fileName,
        content: file.file_content || file.content_text || "",
        created_at: file.created_at,
      })
    })

    // Convert directories set to array of directory objects
    const dirsList = Array.from(dirs)
      .map((path) => {
        const pathParts = path.split("/")
        if (!path) return null
        return {
          type: "directory",
          path,
          name: pathParts[pathParts.length - 1],
        }
      })
      .filter((dir): dir is Directory => dir !== null)

    return {
      directories: dirsList,
      files: filesList,
    }
  }, [packageFiles])
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return "today"
    if (diffDays === 1) return "yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Combine directories and files for display
  const items = [
    ...directories.map((dir) => ({
      ...dir,
      message: "", // TODO insert ai description of directory here!
      time: "",
    })),
    ...files.map((file) => ({
      ...file,
      message: "", // TODO insert ai description of file here!
      time: formatDate(file.created_at),
    })),
  ].sort((a, b) => {
    // Sort directories first, then files
    if (a.type === "directory" && b.type === "file") return -1
    if (a.type === "file" && b.type === "directory") return 1
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name)
  })

  const handleItemClick = (item: any) => {
    if (item.type === "directory") {
      // When directory is clicked, navigate into it by setting it as the active directory
      setActiveDir(item.path)
    } else if (item.type === "file" && onFileClicked) {
      const file = packageFiles.find((f) => f.file_path === item.path)
      if (file) {
        onFileClicked(file)
      }
    }
  }

  // Handle navigation to parent directory
  const handleParentDirectoryClick = () => {
    // Get the parent directory by removing the last part of the path
    const parentDir = activeDir.substring(0, activeDir.lastIndexOf("/"))
    setActiveDir(parentDir)
  }

  if (isLoading) {
    return (
      <div className="mb-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
        <div className="flex items-center px-4 py-2 md:py-3 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0d1117]">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-[#30363d]"
            >
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-32" />
              <div className="ml-auto flex items-center space-x-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center px-4 py-2 md:py-3 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
        {/* Desktop view */}
        <div className="hidden md:flex items-center text-xs">
          <span className="text-gray-500 dark:text-[#8b949e]">
            {activeDir ? `Files in ${activeDir}` : "Files"}
          </span>
        </div>
        <div className="hidden md:flex ml-auto items-center text-xs text-gray-500 dark:text-[#8b949e]">
          <span>
            {files.length} files, {directories.length} directories
          </span>
        </div>

        {/* Mobile view */}
        <div className="md:hidden flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-[#8b949e]">
              {activeDir ? `Files in ${activeDir}` : "Files"}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-[#8b949e]">
            <span>{files.length + directories.length} items</span>
          </div>
        </div>
      </div>

      {/* Files and Directories */}
      <div className="bg-white dark:bg-[#0d1117]">
        {items.length === 0 && !activeDir ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-[#8b949e]">
            No files found
          </div>
        ) : (
          <>
            {/* Parent directory navigation option */}
            {activeDir && (
              <div
                className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d] cursor-pointer group"
                onClick={handleParentDirectoryClick}
              >
                <Folder className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
                <span className="text-sm group-hover:underline">..</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-[#8b949e]">
                  Parent directory
                </span>
              </div>
            )}

            {/* Directory contents */}
            {items
              .filter((item) =>
                isWithinDirectory({ dir: activeDir, path: item.path }),
              )
              .map((item, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d] cursor-pointer group"
                  onClick={() => handleItemClick(item)}
                >
                  {item.type === "directory" ? (
                    <Folder className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
                  )}
                  <span className="text-sm group-hover:underline">
                    {item.name}
                  </span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-[#8b949e]">
                    {item.message}
                  </span>
                  {item.time && (
                    <span className="ml-4 text-xs text-gray-500 dark:text-[#8b949e]">
                      {item.time}
                    </span>
                  )}
                </div>
              ))}

            {/* No files in current directory */}
            {items.filter((item) =>
              isWithinDirectory({ dir: activeDir, path: item.path }),
            ).length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-[#8b949e]">
                No files in this directory
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
