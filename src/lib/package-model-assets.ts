const NODE_MODULES_TSCI_PACKAGE_ASSET_REGEX =
  /^\.?\/?node_modules\/@tsci\/([^/.]+)\.([^/]+)\/(.+)$/

export const normalizeAssetPath = (assetPath: string) =>
  assetPath.startsWith("./") ? assetPath.slice(2) : assetPath

export const getPackageFileLookupParams = ({
  assetUrl,
  releaseId,
  author,
  packageName,
  version,
}: {
  assetUrl: string
  releaseId?: string
  author?: string
  packageName?: string
  version?: string
}): Record<string, string> | null => {
  // Absolute URLs are already resolvable by the CAD viewer.
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(assetUrl)) return null

  const normalizedAssetUrl = normalizeAssetPath(assetUrl)
  const externalPackageMatch = normalizedAssetUrl.match(
    NODE_MODULES_TSCI_PACKAGE_ASSET_REGEX,
  )

  if (externalPackageMatch) {
    const [, externalAuthor, externalPackageName, filePath] =
      externalPackageMatch
    return {
      package_name_with_version: `${externalAuthor}/${externalPackageName}@latest`,
      file_path: `dist/${filePath}`,
    }
  }

  if (releaseId) {
    return {
      package_release_id: releaseId,
      file_path: normalizedAssetUrl,
    }
  }

  if (author && packageName) {
    return {
      package_name_with_version: `${author}/${packageName}@${version || "latest"}`,
      file_path: normalizedAssetUrl,
    }
  }

  return null
}

export type ModelAssetRequest = {
  assetUrls: string[]
  apiBaseUrl: string
  token?: string
  releaseId?: string
  author?: string
  packageName?: string
  version?: string
}

export function loadPackageModelAssets(request: ModelAssetRequest) {
  const controller = new AbortController()
  const blobUrls: string[] = []
  const promise = Promise.all(
    request.assetUrls.map(async (assetUrl) => {
      const lookupParams = getPackageFileLookupParams({ ...request, assetUrl })
      if (!lookupParams) return null
      try {
        const response = await fetch(
          `${request.apiBaseUrl}/package_files/download?${new URLSearchParams(lookupParams)}`,
          {
            signal: controller.signal,
            headers: request.token
              ? { Authorization: `Bearer ${request.token}` }
              : {},
          },
        )
        if (!response.ok || controller.signal.aborted) return null
        const blob = await response.blob()
        // blob() can finish after cleanup, even when fetch was aborted.
        if (controller.signal.aborted) return null
        const blobUrl = URL.createObjectURL(blob)
        blobUrls.push(blobUrl)
        return [assetUrl, blobUrl] as const
      } catch {
        // Preserve the viewer's fallback for unavailable models.
        return null
      }
    }),
  ).then((entries) => {
    const map: Record<string, string> = {}
    for (const entry of entries) {
      if (!entry) continue
      const [assetUrl, blobUrl] = entry
      map[assetUrl] = blobUrl
      map[normalizeAssetPath(assetUrl)] = blobUrl
    }
    return map
  })

  return {
    promise,
    dispose() {
      controller.abort()
      for (const url of blobUrls.splice(0)) URL.revokeObjectURL(url)
    },
  }
}
