"use client"

import { useState, useEffect } from "react"
import { Edit, FileText, Code, Copy, CopyCheck, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { usePackageFile, usePackageFileByPath } from "@/hooks/use-package-files"
import { ShikiCodeViewer } from "./ShikiCodeViewer"
import { SparklesIcon } from "lucide-react"
import MarkdownViewer from "./markdown-viewer"

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  created_at: string
  content_text?: string
}

interface ImportantFilesViewProps {
  importantFiles?: PackageFile[]
  isLoading?: boolean
  onEditClicked?: (file_path?: string | null) => void

  aiDescription?: string
  aiUsageInstructions?: string
  aiReviewText?: string | null
  aiReviewRequested?: boolean
  onRequestAiReview?: () => void
}

export default function ImportantFilesView({
  importantFiles = [],
  aiDescription,
  aiUsageInstructions,
  aiReviewText,
  aiReviewRequested,
  onRequestAiReview,
  isLoading = false,
  onEditClicked,
}: ImportantFilesViewProps) {
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<"copy" | "copied">("copy")

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFileContent)
    setCopyState("copied")
    setTimeout(() => setCopyState("copy"), 500)
  }
  // Determine if we have AI content
  const hasAiContent = Boolean(aiDescription || aiUsageInstructions)
  const hasAiReview = Boolean(aiReviewText)

  // Select the appropriate tab/file when content changes. Once the user has
  // interacted with the tabs we keep their selection and only run this logic
  // if no tab has been chosen yet.
  useEffect(() => {
    if (activeTab !== null) return
    if (isLoading) return

    // First priority: README file if it exists
    const readmeFile = importantFiles.find(
      (file) =>
        file.file_path.toLowerCase().endsWith("readme.md") ||
        file.file_path.toLowerCase().endsWith("readme"),
    )

    if (readmeFile) {
      setActiveFilePath(readmeFile.file_path)
      setActiveTab("file")
    } else if (hasAiContent) {
      // Second priority: AI content if available
      setActiveTab("ai")
      setActiveFilePath(null)
    } else if (hasAiReview) {
      setActiveTab("ai-review")
      setActiveFilePath(null)
    } else if (importantFiles.length > 0) {
      // Third priority: First important file
      setActiveFilePath(importantFiles[0].file_path)
      setActiveTab("file")
    }
  }, [
    aiDescription,
    aiUsageInstructions,
    aiReviewText,
    hasAiContent,
    hasAiReview,
    importantFiles,
    activeTab,
    isLoading,
  ])

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

  // Render AI content
  const renderAiContent = () => {
    return (
      <div className="markdown-content">
        {aiDescription && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <MarkdownViewer markdownContent={aiDescription} />
          </div>
        )}
        {aiUsageInstructions && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Instructions</h3>
            <MarkdownViewer markdownContent={aiUsageInstructions} />
          </div>
        )}
      </div>
    )
  }

  const renderAiReviewContent = () => {
    if (!aiReviewText && !aiReviewRequested) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Get detailed feedback and suggestions for improving your package
                from our AI assistant.
              </p>
            </div>
            <Button
              onClick={onRequestAiReview}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Request AI Review
            </Button>
          </div>
        </div>
      )
    }

    if (!aiReviewText && aiReviewRequested) {
      return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Our AI is analyzing your package. This usually takes a few
                minutes. Please check back shortly.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return <MarkdownViewer markdownContent={aiReviewText || ""} />
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
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
          {/* AI Description Tab */}
          {hasAiContent && (
            <button
              className={`flex items-center px-3 py-1.5 rounded-md text-xs flex-shrink-0 whitespace-nowrap ${
                activeTab === "ai"
                  ? "bg-gray-200 dark:bg-[#30363d] font-medium"
                  : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
              onClick={() => {
                setActiveTab("ai")
                setActiveFilePath(null)
              }}
            >
              <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Description</span>
            </button>
          )}

          {/* AI Review Tab */}
          <button
            className={`flex items-center px-3 py-1.5 rounded-md text-xs flex-shrink-0 whitespace-nowrap ${
              activeTab === "ai-review"
                ? "bg-gray-200 dark:bg-[#30363d] font-medium"
                : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
            }`}
            onClick={() => {
              setActiveTab("ai-review")
              setActiveFilePath(null)
            }}
          >
            <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
            <span>AI Review</span>
          </button>

          {/* File Tabs */}
          {importantFiles.map((file) => (
            <button
              key={file.package_file_id}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs flex-shrink-0 whitespace-nowrap ${
                activeTab === "file" && activeFilePath === file.file_path
                  ? "bg-gray-200 dark:bg-[#30363d] font-medium"
                  : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
              }`}
              onClick={() => {
                setActiveTab("file")
                setActiveFilePath(file.file_path)
              }}
            >
              {getFileIcon(file.file_path)}
              <span>{getFileName(file.file_path)}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center">
          {activeFileContent && (
            <button
              className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md transition-all duration-300"
              onClick={handleCopy}
            >
              {copyState === "copy" ? (
                <Copy className="h-4 w-4" />
              ) : (
                <CopyCheck className="h-4 w-4" />
              )}
              <span className="sr-only">Copy</span>
            </button>
          )}
          <button
            className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md"
            onClick={() => onEditClicked?.(activeFilePath)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#0d1117]">
        {activeTab === "ai" ? (
          renderAiContent()
        ) : activeTab === "ai-review" ? (
          renderAiReviewContent()
        ) : activeFilePath &&
          (activeFilePath.endsWith(".md") ||
            activeFilePath?.toLowerCase().endsWith("readme")) ? (
          <MarkdownViewer markdownContent={activeFileContent} />
        ) : activeFilePath &&
          (activeFilePath.endsWith(".js") ||
            activeFilePath.endsWith(".jsx") ||
            activeFilePath.endsWith(".ts") ||
            activeFilePath.endsWith(".tsx")) ? (
          <div className="overflow-x-auto">
            <ShikiCodeViewer
              code={activeFileContent}
              filePath={activeFilePath}
            />
          </div>
        ) : (
          <pre className="whitespace-pre-wrap">{activeFileContent}</pre>
        )}
      </div>
    </div>
  )
}
