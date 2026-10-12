/** Resolve package-local images against the Markdown file, not the page URL. */
export function resolveMarkdownImageUrl(
  src: string | undefined,
  {
    packageReleaseId,
    filePath = "README.md",
    apiBaseUrl,
  }: {
    packageReleaseId?: string
    filePath?: string
    apiBaseUrl: string
  },
): string | undefined {
  if (!src || !packageReleaseId || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(src)) {
    return src
  }

  try {
    const basePath = filePath.split("/").map(encodeURIComponent).join("/")
    const image = new URL(src, `https://package.invalid/${basePath}`)
    const params = new URLSearchParams({
      package_release_id: packageReleaseId,
      file_path: decodeURIComponent(image.pathname.slice(1)),
    })
    return `${apiBaseUrl.replace(/\/$/, "")}/package_files/download?${params}${image.hash}`
  } catch {
    return src
  }
}
