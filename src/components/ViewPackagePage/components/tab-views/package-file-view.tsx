import { AlertTriangle, FileText, Loader2 } from "lucide-react"
import { usePackageFile } from "@/hooks/use-package-files"
import { ShikiCodeViewer } from "../ShikiCodeViewer"
import MarkdownViewer from "../markdown-viewer"

interface PackageFileViewProps {
  packageReleaseId?: string
  filePath: string
  onDirectoryClicked?: (directoryPath: string) => void
}

const isMarkdownFile = (filePath: string) =>
  filePath.toLowerCase().endsWith(".md") ||
  filePath.toLowerCase().endsWith("/readme") ||
  filePath.toLowerCase() === "readme"

export default function PackageFileView({
  packageReleaseId,
  filePath,
  onDirectoryClicked,
}: PackageFileViewProps) {
  const {
    data: file,
    error,
    isLoading,
  } = usePackageFile(
    packageReleaseId
      ? {
          package_release_id: packageReleaseId,
          file_path: filePath,
        }
      : null,
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  )
  const pathParts = filePath.split("/").filter(Boolean)
  const fileName = pathParts.at(-1) || filePath

  const renderBreadcrumbs = () => (
    <div className="flex min-w-0 items-center text-xs text-gray-500 dark:text-[#8b949e]">
      <button
        type="button"
        className="flex-shrink-0 hover:underline"
        onClick={() => onDirectoryClicked?.("")}
      >
        Files
      </button>
      {pathParts.map((part, index) => {
        const isFileName = index === pathParts.length - 1
        const path = pathParts.slice(0, index + 1).join("/")

        return (
          <span key={path} className="flex min-w-0 items-center">
            <span className="px-1">/</span>
            {isFileName ? (
              <span className="truncate text-gray-700 dark:text-[#c9d1d9]">
                {part}
              </span>
            ) : (
              <button
                type="button"
                className="truncate hover:underline"
                onClick={() => onDirectoryClicked?.(path)}
              >
                {part}
              </button>
            )}
          </span>
        )
      })}
    </div>
  )

  return (
    <div className="mb-4 min-w-0 overflow-hidden rounded-md border border-gray-200 dark:border-[#30363d]">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2 sm:px-4 md:py-3 dark:border-[#30363d] dark:bg-[#161b22]">
        <FileText className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-[#8b949e]" />
        {renderBreadcrumbs()}
      </div>

      <div className="bg-white dark:bg-[#0d1117]">
        {isLoading || !packageReleaseId ? (
          <div className="flex items-center justify-center px-4 py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 dark:text-[#8b949e]" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <AlertTriangle className="mb-3 h-6 w-6 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-gray-900 dark:text-[#c9d1d9]">
              File not found
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-[#8b949e]">
              {fileName} is not available in this package release.
            </p>
          </div>
        ) : file?.content_text == null ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-[#8b949e]">
            A preview is not available for this file.
          </div>
        ) : file.content_text === "" ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-[#8b949e]">
            This file is empty.
          </div>
        ) : isMarkdownFile(filePath) ? (
          <div className="p-4 sm:p-6">
            <MarkdownViewer markdownContent={file.content_text} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ShikiCodeViewer code={file.content_text} filePath={filePath} />
          </div>
        )}
      </div>
    </div>
  )
}
