import type { PackageFile as ApiPackageFile } from "fake-snippets-api/lib/db/schema"
import { isHiddenFile } from "../../utils/is-hidden-file"

interface PackageFile extends ApiPackageFile {
  file_content?: string
  content_text?: string | null
}

export interface FilesViewDirectoryItem {
  type: "directory"
  path: string
  name: string
  created_at: string
}

export interface FilesViewFileItem {
  type: "file"
  path: string
  name: string
  content: string
  created_at: string
}

export const formatFilesViewDate = (dateString: string, now = new Date()) => {
  const parsedDate = new Date(dateString)
  if (Number.isNaN(parsedDate.getTime())) return ""

  const diffMs = now.getTime() - parsedDate.getTime()
  const oneDayMs = 1000 * 60 * 60 * 24

  if (diffMs <= 0) return "today"
  if (diffMs < oneDayMs) return "today"

  const diffDays = Math.floor(diffMs / oneDayMs)
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

const getTimestampValue = (dateString: string) => {
  const timestamp = new Date(dateString).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export const buildFilesViewEntries = ({
  packageFiles,
  showHiddenFiles,
}: {
  packageFiles: PackageFile[]
  showHiddenFiles: boolean
}) => {
  if (!packageFiles.length) {
    return {
      directories: [] as FilesViewDirectoryItem[],
      files: [] as FilesViewFileItem[],
    }
  }

  const visibleFiles = packageFiles.filter(
    (file) => showHiddenFiles || !isHiddenFile(file.file_path),
  )
  const directoryTimestamps = new Map<string, string>()

  const files = visibleFiles.map((file) => {
    const normalizedPath = file.file_path.replace(/^\/+/, "")
    const pathParts = normalizedPath.split("/")
    const fileName = pathParts.pop() || normalizedPath

    let currentPath = ""
    pathParts.forEach((part) => {
      currentPath += (currentPath ? "/" : "") + part

      const currentTimestamp = directoryTimestamps.get(currentPath)
      const nextTimestamp = file.created_at
      const currentValue =
        currentTimestamp === undefined ? null : getTimestampValue(currentTimestamp)
      const nextValue = getTimestampValue(nextTimestamp)

      if (
        currentTimestamp === undefined ||
        currentValue === null ||
        (nextValue !== null && nextValue > currentValue)
      ) {
        directoryTimestamps.set(currentPath, nextTimestamp)
      }
    })

    return {
      type: "file" as const,
      path: file.file_path,
      name: fileName,
      content: file.file_content || file.content_text || "",
      created_at: file.created_at,
    }
  })

  const directories = Array.from(directoryTimestamps.entries())
    .map(([path, created_at]) => {
      if (!path) return null

      const pathParts = path.split("/")
      return {
        type: "directory" as const,
        path,
        name: pathParts[pathParts.length - 1] || path,
        created_at,
      }
    })
    .filter((directory): directory is FilesViewDirectoryItem => directory !== null)

  return { directories, files }
}
