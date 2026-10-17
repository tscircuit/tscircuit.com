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

/** Resolve relative Markdown links inside their package and selected release. */
export const resolvePackageMarkdownLink = (
  href: string | undefined,
  {
    author,
    packageName,
    packageReleaseId,
    filePath = "README.md",
  }: {
    author?: string
    packageName?: string
    packageReleaseId?: string
    filePath?: string
  },
) => {
  if (
    !href ||
    !author ||
    !packageName ||
    !packageReleaseId ||
    /^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)
  ) {
    return href
  }

  try {
    const target = new URL(
      href,
      `https://package.invalid/${encodePath(filePath)}`,
    )
    const path = decodeURIComponent(target.pathname.slice(1))
    const route = target.pathname.endsWith("/")
      ? getPackageDirectoryUrl({ author, packageName, directoryPath: path })
      : getPackageFileUrl({ author, packageName, filePath: path })
    const params = new URLSearchParams(target.search)
    params.set("package_release_id", packageReleaseId)
    return `${route}?${params}${target.hash}`
  } catch {
    return href
  }
}
