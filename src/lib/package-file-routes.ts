import type { PackagePreviewSelection } from "./package-preview-selection"

const encodePath = (path: string) =>
  path
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/")

export const decodePackageFilePath = (path?: string) => {
  if (!path) return ""

  return path
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
    .join("/")
}

export const getPackageRootUrl = (author: string, packageName: string) =>
  `/${encodeURIComponent(author)}/${encodeURIComponent(packageName)}`

export const getPackageDirectoryUrl = ({
  author,
  packageName,
  directoryPath,
}: {
  author: string
  packageName: string
  directoryPath: string
}) => {
  const rootUrl = getPackageRootUrl(author, packageName)
  const encodedPath = encodePath(directoryPath)

  return encodedPath ? `${rootUrl}/tree/${encodedPath}` : rootUrl
}

export const getPackageFileUrl = ({
  author,
  packageName,
  filePath,
}: {
  author: string
  packageName: string
  filePath: string
}) => `${getPackageRootUrl(author, packageName)}/blob/${encodePath(filePath)}`

export function getPackagePreviewUrl({
  author,
  packageName,
  selection,
  customize = false,
}: {
  author: string
  packageName: string
  selection: PackagePreviewSelection
  customize?: boolean
}) {
  const params = new URLSearchParams()
  if (selection.release) params.set("package_release_id", selection.release)
  if (selection.file) params.set("preview_file", selection.file)
  const view = ["schematic", "pcb", "3d"].includes(selection.view ?? "")
    ? selection.view
    : "schematic"
  return `${getPackageRootUrl(author, packageName)}${customize ? "/customize" : ""}${params.size ? `?${params}` : ""}#${view}`
}
