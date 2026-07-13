import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Pencil,
} from "lucide-react"
import { useState } from "react"
import { saveAs } from "file-saver"
import { usePackageFile } from "@/hooks/use-package-files"
import { useAxios } from "@/hooks/use-axios"
import { Button } from "@/components/ui/button"
import { ShikiCodeViewer } from "../ShikiCodeViewer"
import MarkdownViewer from "../markdown-viewer"
import PackageFileArtifactPreview from "./package-file-artifact-preview"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"

interface PackageFileViewProps {
  packageReleaseId?: string
  filePath: string
  packageFiles?: Pick<PackageFile, "file_path" | "package_file_id">[]
  onDirectoryClicked?: (directoryPath: string) => void
  onOpenInEditor?: () => void
}

const isMarkdownFile = (filePath: string) =>
  filePath.toLowerCase().endsWith(".md") ||
  filePath.toLowerCase().endsWith("/readme") ||
  filePath.toLowerCase() === "readme"

export default function PackageFileView({
  packageReleaseId,
  filePath,
  packageFiles,
  onDirectoryClicked,
  onOpenInEditor,
}: PackageFileViewProps) {
  const axios = useAxios()
  const [isDownloading, setIsDownloading] = useState(false)
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

  const handleDownload = async () => {
    if (!file?.package_file_id || isDownloading) return

    setIsDownloading(true)
    try {
      const response = await axios.get("/package_files/download", {
        params: { package_file_id: file.package_file_id },
        responseType: "blob",
      })
      saveAs(response.data, fileName)
    } catch (error) {
      console.error(`Failed to download ${fileName}:`, error)
    } finally {
      setIsDownloading(false)
    }
  }

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
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={`Download ${fileName}`}
            title="Download file"
            disabled={!file || isDownloading}
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 flex-shrink-0"
            onClick={onOpenInEditor}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Open in Editor
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d1117]">
        <PackageFileArtifactPreview
          packageReleaseId={packageReleaseId}
          selectedFilePath={filePath}
          packageFiles={packageFiles}
        />
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
