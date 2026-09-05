import { useEffect, useState } from "react"
import type { PackageFile } from "fake-snippets-api/lib/db/schema"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import {
  getPackageFileImageKind,
  getPackageFileImageUrl,
} from "@/lib/package-file-image"
import { ShikiCodeViewer } from "../ShikiCodeViewer"
import MarkdownViewer from "../markdown-viewer"

type SvgDisplayMode = "preview" | "code"

interface PackageFileContentProps {
  file: PackageFile | undefined
  fileName: string
  filePath: string
  isMarkdownFile: boolean
}

const ImagePreview = ({
  fileName,
  imageUrl,
}: {
  fileName: string
  imageUrl: string
}) => {
  const [hasImageError, setHasImageError] = useState(false)

  useEffect(() => {
    setHasImageError(false)
  }, [imageUrl])

  if (hasImageError) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-[#8b949e]">
        The image preview could not be loaded.
      </div>
    )
  }

  return (
    <div className="flex min-h-64 items-center justify-center bg-gray-50 p-4 dark:bg-[#161b22]">
      <img
        src={imageUrl}
        alt={`${fileName} preview`}
        loading="lazy"
        decoding="async"
        className="max-h-[42rem] max-w-full rounded-md border border-gray-200 bg-white object-contain dark:border-[#30363d]"
        onError={() => setHasImageError(true)}
      />
    </div>
  )
}

const SvgDisplayToggle = ({
  displayMode,
  onDisplayModeChange,
}: {
  displayMode: SvgDisplayMode
  onDisplayModeChange: (displayMode: SvgDisplayMode) => void
}) => (
  <div className="flex justify-end border-b border-gray-200 bg-gray-50 p-2 dark:border-[#30363d] dark:bg-[#161b22]">
    <div
      className="inline-flex rounded-md border border-gray-200 bg-gray-100 p-0.5 text-xs dark:border-[#30363d] dark:bg-[#0d1117]"
      role="group"
      aria-label="SVG display"
    >
      <button
        type="button"
        className="rounded px-2.5 py-1 text-gray-600 hover:text-gray-900 aria-pressed:bg-white aria-pressed:text-gray-900 aria-pressed:shadow-sm dark:text-[#8b949e] dark:hover:text-[#c9d1d9] dark:aria-pressed:bg-[#21262d] dark:aria-pressed:text-[#c9d1d9]"
        aria-pressed={displayMode === "preview"}
        onClick={() => onDisplayModeChange("preview")}
      >
        Preview
      </button>
      <button
        type="button"
        className="rounded px-2.5 py-1 text-gray-600 hover:text-gray-900 aria-pressed:bg-white aria-pressed:text-gray-900 aria-pressed:shadow-sm dark:text-[#8b949e] dark:hover:text-[#c9d1d9] dark:aria-pressed:bg-[#21262d] dark:aria-pressed:text-[#c9d1d9]"
        aria-pressed={displayMode === "code"}
        onClick={() => onDisplayModeChange("code")}
      >
        Code
      </button>
    </div>
  </div>
)

export const PackageFileContent = ({
  file,
  fileName,
  filePath,
  isMarkdownFile,
}: PackageFileContentProps) => {
  const apiBaseUrl = useApiBaseUrl()
  const [svgDisplayMode, setSvgDisplayMode] =
    useState<SvgDisplayMode>("preview")

  useEffect(() => {
    setSvgDisplayMode("preview")
  }, [filePath])

  if (!file) return null

  const imageKind = getPackageFileImageKind(file.content_mimetype)
  if (imageKind && file.package_file_id) {
    const imageUrl = getPackageFileImageUrl({
      apiBaseUrl,
      packageFileId: file.package_file_id,
    })

    if (imageKind === "svg") {
      return (
        <>
          <SvgDisplayToggle
            displayMode={svgDisplayMode}
            onDisplayModeChange={setSvgDisplayMode}
          />
          {svgDisplayMode === "preview" && (
            <ImagePreview fileName={fileName} imageUrl={imageUrl} />
          )}
          {svgDisplayMode === "code" && file.content_text != null && (
            <div className="overflow-x-auto">
              <ShikiCodeViewer code={file.content_text} filePath={filePath} />
            </div>
          )}
        </>
      )
    }

    return <ImagePreview fileName={fileName} imageUrl={imageUrl} />
  }

  if (file.content_text == null) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-[#8b949e]">
        A preview is not available for this file.
      </div>
    )
  }

  if (file.content_text === "") {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-[#8b949e]">
        This file is empty.
      </div>
    )
  }

  if (isMarkdownFile) {
    return (
      <div className="p-4 sm:p-6">
        <MarkdownViewer markdownContent={file.content_text} />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <ShikiCodeViewer code={file.content_text} filePath={filePath} />
    </div>
  )
}
