"use client"

import { useState, useEffect } from "react"
import { Edit, FileText, Code } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePackageFile, usePackageFileByPath } from "@/hooks/use-package-files"

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  created_at: string
}

interface ImportantFilesViewProps {
  importantFiles?: PackageFile[]
  isLoading?: boolean
  onEditClicked?: () => void

  aiDescription?: string
  aiUsage?: string
}

export default function ImportantFilesView({
  importantFiles = [],
  aiDescription,
  aiUsage,
  isLoading = false,
  onEditClicked,
}: ImportantFilesViewProps) {
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)

  // Select the first file when importantFiles changes
  useEffect(() => {
    if (importantFiles.length > 0 && !activeFilePath) {
      setActiveFilePath(importantFiles[0].file_path)
    }
  }, [importantFiles, activeFilePath])

  // Get file name from path
  const getFileName = (path: string) => {
    const parts = path.split("/")
    return parts[parts.length - 1]
  }

  // Get file icon based on extension
  const getFileIcon = (path: string) => {
    if (
      path.endsWith(".js") ||
      path.endsWith(".jsx") ||
      path.endsWith(".ts") ||
      path.endsWith(".tsx")
    ) {
      return <Code className="h-3.5 w-3.5 mr-1.5" />
    }
    return <FileText className="h-3.5 w-3.5 mr-1.5" />
  }

  // Get active file content
  const partialActiveFile = importantFiles.find(
    (file) => file.file_path === activeFilePath,
  )
  const { data: activeFileFull } = usePackageFile(
    partialActiveFile
      ? {
          file_path: partialActiveFile.file_path,
          package_release_id: partialActiveFile.package_release_id,
        }
      : null,
  )
  const activeFileContent = activeFileFull?.content_text || ""

  if (isLoading) {
    return (
      <div className="mt-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
        <div className="flex items-center pl-2 pr-4 py-2 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="ml-auto flex items-center">
            <Skeleton className="h-4 w-4 mr-1" />
            <Skeleton className="h-4 w-4 ml-2" />
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0d1117]">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/5 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (importantFiles.length === 0) {
    return (
      <div className="mt-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
        <div className="flex items-center pl-2 pr-4 py-2 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            <span className="font-semibold">No important files found</span>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-[#0d1117]">
          <p className="text-gray-500 dark:text-[#8b949e]">
            No README, LICENSE, or other important files found in this
            repository.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center pl-2 pr-4 py-2 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center space-x-4">
          {importantFiles.map((file) => (
            <button
              key={file.package_file_id}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs ${
                activeFilePath === file.file_path
                  ? "bg-gray-200 dark:bg-[#30363d] font-medium"
                  : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
              onClick={() => setActiveFilePath(file.file_path)}
            >
              {getFileIcon(file.file_path)}
              <span>{getFileName(file.file_path)}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center">
          <button
            className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md"
            onClick={onEditClicked}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#0d1117]">
        {activeFilePath && activeFilePath.endsWith(".md") ? (
          <div className="markdown-content">
            {/* In a real app, you'd use a markdown renderer here */}
            <pre className="whitespace-pre-wrap">{activeFileContent}</pre>
          </div>
        ) : activeFilePath &&
          (activeFilePath.endsWith(".js") ||
            activeFilePath.endsWith(".jsx") ||
            activeFilePath.endsWith(".ts") ||
            activeFilePath.endsWith(".tsx")) ? (
          <pre className="bg-gray-100 dark:bg-[#161b22] p-4 rounded-md overflow-auto">
            <code>{activeFileContent}</code>
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap">{activeFileContent}</pre>
        )}
      </div>
    </div>
  )
}
