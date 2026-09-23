import { useCallback, useEffect, useState } from "react"
import {
  loadPackageModelAssets,
  normalizeAssetPath,
  type ModelAssetRequest,
} from "@/lib/package-model-assets"

// The caller memoizes the request so completed assets belong to exactly one
// circuit/release/session. A changed request is loading on its very first render.
export function usePackageModelAssets(request: ModelAssetRequest) {
  const [result, setResult] = useState<{
    request: ModelAssetRequest
    urls: Record<string, string>
  } | null>(null)

  useEffect(() => {
    if (request.assetUrls.length === 0) return
    let cancelled = false
    const load = loadPackageModelAssets(request)
    load.promise.then((urls) => {
      if (!cancelled) setResult({ request, urls })
    })
    return () => {
      cancelled = true
      load.dispose()
    }
  }, [request])

  const urls = result?.request === request ? result.urls : undefined
  const resolveStaticAsset = useCallback(
    (path: string) => urls?.[path] ?? urls?.[normalizeAssetPath(path)] ?? path,
    [urls],
  )
  return {
    resolveStaticAsset,
    isLoading: request.assetUrls.length > 0 && !urls,
  }
}
