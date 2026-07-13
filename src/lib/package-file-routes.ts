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
