import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Edit,
  FileText,
  Code,
  Copy,
  CopyCheck,
  Loader2,
  RefreshCcwIcon,
  SparklesIcon,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { usePackageFile } from "@/hooks/use-package-files"
import { ShikiCodeViewer, SKELETON_WIDTHS } from "./ShikiCodeViewer"
import MarkdownViewer from "./markdown-viewer"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"

interface PackageFile {
  package_file_id: string
  package_release_id: string
  file_path: string
  created_at: string
  content_text?: string | null
}

interface ImportantFilesViewProps {
  importantFiles?: PackageFile[]
  isFetched?: boolean
  onEditClicked?: (file_path?: string | null) => void
  packageAuthorOwner?: string | null
  aiDescription?: string
  aiUsageInstructions?: string
  aiReviewText?: string | null
  aiReviewRequested?: boolean
  onRequestAiReview?: () => void
  onRefreshReadme?: (activeTabType?: string) => void
  onLicenseFileRequested?: boolean
  isRefreshingAi?: boolean
}

type TabType = "ai" | "ai-review" | "file"

interface TabInfo {
  type: TabType
  filePath?: string | null
  label: string
  icon: React.ReactNode
}

export default function ImportantFilesView({
  importantFiles = [],
  aiDescription,
  aiUsageInstructions,
  aiReviewText,
  aiReviewRequested,
  onRequestAiReview,
  onRefreshReadme,

  isFetched = false,

  onEditClicked,

  packageAuthorOwner,

  onLicenseFileRequested,

  isRefreshingAi,
}: ImportantFilesViewProps) {
  const [activeTab, setActiveTab] = useState<TabInfo | null>(null)
  const [copyState, setCopyState] = useState<"copy" | "copied">("copy")
  const [refreshState, setRefreshState] = useState<"idle" | "refreshing">(
    "idle",
  )
  const { session: user } = useGlobalStore()

  // Memoized computed values
  const hasAiContent = useMemo(
    () => Boolean(aiDescription || aiUsageInstructions),
    [aiDescription, aiUsageInstructions],
  )
  const hasAiReview = useMemo(() => Boolean(aiReviewText), [aiReviewText])
  const isOwner = useMemo(
    () => user?.github_username === packageAuthorOwner,
    [user?.github_username, packageAuthorOwner],
  )

  // File type utilities
  const isLicenseFile = useCallback((filePath: string) => {
    const lowerPath = filePath.toLowerCase()
    return (
      lowerPath === "license" ||
      lowerPath.endsWith("/license") ||
      lowerPath === "license.txt" ||
      lowerPath.endsWith("/license.txt") ||
      lowerPath === "license.md" ||
      lowerPath.endsWith("/license.md")
    )
  }, [])

  const isReadmeFile = useCallback((filePath: string) => {
    const lowerPath = filePath.toLowerCase()
    return lowerPath.endsWith("readme.md") || lowerPath.endsWith("readme")
  }, [])

  const isCodeFile = useCallback((filePath: string) => {
    return (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    )
  }, [])

  const isMarkdownFile = useCallback(
    (filePath: string) => {
      return filePath.endsWith(".md") || isReadmeFile(filePath)
    },
    [isReadmeFile],
  )

  const getFileName = useCallback((path: string) => {
    const parts = path.split("/")
    return parts[parts.length - 1]
  }, [])

  const getFileIcon = useCallback(
    (path: string) => {
      return isCodeFile(path) ? (
        <Code className="h-3.5 w-3.5 mr-1.5" />
      ) : (
        <FileText className="h-3.5 w-3.5 mr-1.5" />
      )
    },
    [isCodeFile],
  )

  // Available tabs computation
  const availableTabs = useMemo((): TabInfo[] => {
    const tabs: TabInfo[] = []

    // Only show AI description tab if there's actual AI content
    if (hasAiContent) {
      tabs.push({
        type: "ai",
        filePath: null,
        label: "Description",
        icon: <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />,
      })
    }

    // Only show AI review tab if there's actual AI review content
    if (hasAiReview || isOwner) {
      tabs.push({
        type: "ai-review",
        filePath: null,
        label: "AI Review",
        icon: <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />,
      })
    }

    importantFiles.forEach((file) => {
      tabs.push({
        type: "file",
        filePath: file.file_path,
        label: getFileName(file.file_path),
        icon: getFileIcon(file.file_path),
      })
    })

    return tabs
  }, [hasAiContent, hasAiReview, importantFiles, getFileName, getFileIcon])

  // Find default tab with fallback logic
  const getDefaultTab = useCallback((): TabInfo | null => {
    if (!isFetched || availableTabs.length === 0) return null

    // Priority 1: README file
    const readmeTab = availableTabs.find(
      (tab) =>
        tab.type === "file" && tab.filePath && isReadmeFile(tab.filePath),
    )
    if (readmeTab) return readmeTab

    // Priority 2: AI content (only if available)
    const aiTab = availableTabs.find((tab) => tab.type === "ai" && hasAiContent)
    if (aiTab) return aiTab

    // Priority 3: AI review
    const aiReviewTab = availableTabs.find(
      (tab) => tab.type === "ai-review" && hasAiReview,
    )
    if (aiReviewTab) return aiReviewTab

    // Priority 4: First file
    const firstFileTab = availableTabs.find((tab) => tab.type === "file")
    if (firstFileTab) return firstFileTab

    return null
  }, [isFetched, availableTabs, isReadmeFile])

  // Handle tab selection with validation
  const selectTab = useCallback(
    (tab: TabInfo) => {
      // Validate that the tab still exists (for file tabs)
      if (tab.type === "file" && tab.filePath) {
        const fileExists = importantFiles.some(
          (file) => file.file_path === tab.filePath,
        )
        if (!fileExists) {
          // File was deleted, fallback to default tab
          const defaultTab = getDefaultTab()
          setActiveTab(defaultTab)
          return
        }
      }
      setActiveTab(tab)
    },
    [importantFiles, getDefaultTab],
  )

  // Handle license file request
  useEffect(() => {
    if (onLicenseFileRequested && importantFiles.length > 0) {
      const licenseTab = availableTabs.find(
        (tab) =>
          tab.type === "file" && tab.filePath && isLicenseFile(tab.filePath),
      )

      if (licenseTab) {
        setActiveTab(licenseTab)
      } else {
        // License file not found, fallback to default
        const defaultTab = getDefaultTab()
        setActiveTab(defaultTab)
      }
    }
  }, [
    onLicenseFileRequested,
    importantFiles,
    availableTabs,
    isLicenseFile,
    getDefaultTab,
  ])

  // Set default tab when no tab is active
  useEffect(() => {
    if (activeTab === null && isFetched) {
      const defaultTab = getDefaultTab()
      setActiveTab(defaultTab)
    }
  }, [activeTab, isFetched, getDefaultTab])

  // Validate active tab still exists (handles file deletion)
  useEffect(() => {
    if (activeTab?.type === "file" && activeTab.filePath) {
      const fileExists = importantFiles.some(
        (file) => file.file_path === activeTab.filePath,
      )
      if (!fileExists) {
        // Active file was deleted, fallback to default
        const defaultTab = getDefaultTab()
        setActiveTab(defaultTab)
      }
    }
  }, [activeTab, importantFiles, getDefaultTab])

  const { circuitJson } = useCurrentPackageCircuitJson()

  // Get active file content
  const partialActiveFile = useMemo(() => {
    if (activeTab?.type !== "file" || !activeTab.filePath) return null
    return importantFiles.find((file) => file.file_path === activeTab.filePath)
  }, [activeTab, importantFiles])

  const { data: activeFileFull, isFetched: isActiveFileFetched } =
    usePackageFile(
      partialActiveFile
        ? {
            file_path: partialActiveFile.file_path,
            package_release_id: partialActiveFile.package_release_id,
          }
        : null,
      {
        keepPreviousData: true,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    )

  const activeFileContent = activeFileFull?.content_text || ""

  const handleCopy = () => {
    let textToCopy = ""

    if (activeTab?.type === "ai-review" && aiReviewText) {
      textToCopy = aiReviewText
    } else if (activeTab?.type === "file" && activeFileContent) {
      textToCopy = activeFileContent
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopyState("copied")
      setTimeout(() => setCopyState("copy"), 500)
    }
  }

  const handleRefresh = () => {
    onRefreshReadme?.(activeTab?.type)
    if (activeTab?.type !== "ai") {
      setRefreshState("refreshing")
      setTimeout(() => setRefreshState("idle"), 800)
    }
  }

  const isActuallyRefreshing =
    (activeTab?.type === "ai" && isRefreshingAi) ||
    (activeTab?.type !== "ai" && refreshState === "refreshing")
  // Render content based on active tab
  const renderAiContent = useCallback(
    () => (
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
    ),
    [aiDescription, aiUsageInstructions],
  )

  const renderAiReviewContent = useCallback(() => {
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
            {!isOwner ? (
              <p className="text-sm text-gray-500">
                Only the package owner can generate an AI review
              </p>
            ) : !Boolean(circuitJson) ? (
              <p className="text-sm text-gray-500">
                Circuit JSON is required for AI review.
              </p>
            ) : (
              <Button
                onClick={onRequestAiReview}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                Request AI Review
              </Button>
            )}
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
  }, [aiReviewText, aiReviewRequested, isOwner, onRequestAiReview])

  const renderFileContent = useCallback(() => {
    if (!isActiveFileFetched || !activeTab?.filePath || !activeFileContent) {
      ;<div className="text-sm p-4">
        {SKELETON_WIDTHS.map((w, i) => (
          <Skeleton key={i} className={`h-4 mb-2 ${w}`} />
        ))}
      </div>
    }

    if (isMarkdownFile(String(activeTab?.filePath))) {
      return <MarkdownViewer markdownContent={activeFileContent} />
    }

    if (isCodeFile(String(activeTab?.filePath))) {
      return (
        <div className="overflow-x-auto no-scrollbar">
          <ShikiCodeViewer
            code={activeFileContent}
            filePath={String(activeTab?.filePath)}
          />
        </div>
      )
    }

    return <pre className="whitespace-pre-wrap">{activeFileContent}</pre>
  }, [activeTab, activeFileContent, isMarkdownFile, isCodeFile])

  const renderTabContent = useCallback(() => {
    if (!activeTab) return null

    switch (activeTab.type) {
      case "ai":
        return renderAiContent()
      case "ai-review":
        return renderAiReviewContent()
      case "file":
        return renderFileContent()
      default:
        return null
    }
  }, [activeTab, renderAiContent, renderAiReviewContent, renderFileContent])

  // Tab styling helper
  const getTabClassName = useCallback(
    (tab: TabInfo) => {
      const isActive =
        activeTab?.type === tab.type &&
        (tab.type !== "file" || activeTab?.filePath === tab.filePath)

      return `flex items-center px-3 py-1.5 rounded-md text-xs flex-shrink-0 whitespace-nowrap ${
        isActive
          ? "bg-gray-200 dark:bg-[#30363d] font-medium"
          : "text-gray-500 dark:text-[#8b949e] hover:bg-gray-200 dark:hover:bg-[#30363d]"
      }`
    },
    [activeTab],
  )

  if (!isFetched) {
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

  if (importantFiles.length === 0 && !hasAiContent && !hasAiReview) {
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
          {availableTabs.map((tab, index) => (
            <button
              key={`${tab.type}-${tab.filePath || index}`}
              className={getTabClassName(tab)}
              onClick={() => selectTab(tab)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center">
          {((activeTab?.type === "file" && activeFileContent) ||
            (activeTab?.type === "ai-review" && aiReviewText)) && (
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
          {activeTab?.type === "ai-review" && aiReviewText && isOwner && (
            <button
              className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md ml-1"
              onClick={onRequestAiReview}
              title="Re-request AI Review"
            >
              <RefreshCcwIcon className="h-4 w-4" />
              <span className="sr-only">Re-request AI Review</span>
            </button>
          )}
          {(activeTab?.type === "ai" || activeTab?.type === "file") &&
            onRefreshReadme && (
              <button
                className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md ml-1 transition-all duration-200"
                onClick={handleRefresh}
                title={
                  activeTab?.type === "ai"
                    ? "Refresh Description"
                    : "Refresh README"
                }
                disabled={isActuallyRefreshing}
              >
                <RefreshCcwIcon
                  className={`h-4 w-4 transition-transform duration-500 ${
                    isActuallyRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="sr-only">
                  {activeTab?.type === "ai"
                    ? "Refresh Description"
                    : "Refresh README"}
                </span>
              </button>
            )}
          {activeTab?.type === "file" && (
            <button
              className="hover:bg-gray-200 dark:hover:bg-[#30363d] p-1 rounded-md ml-1"
              onClick={() => onEditClicked?.(activeTab.filePath)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </button>
          )}
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-[#0d1117]">{renderTabContent()}</div>
    </div>
  )
}
