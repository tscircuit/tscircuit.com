import {
  createDefaultMapFromCDN,
  knownLibFilesForCompilerOptions,
} from "@typescript/vfs"
import { get, set } from "idb-keyval"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"
import ts from "typescript"

const TS_LIB_VERSION = "5.6.3"
const CACHE_PREFIX = `ts-lib-${TS_LIB_VERSION}-`
const PACKAGE_CACHE_PREFIX = `ts-pkg-dep-`
const CACHE_VERSION = "1.0.0"

export async function loadDefaultLibMap(): Promise<Map<string, string>> {
  const fsMap = new Map<string, string>()
  const libs = knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2022 },
    ts,
  )
  const missing: string[] = []

  for (const lib of libs) {
    const cached = await get(CACHE_PREFIX + lib)
    if (cached) {
      fsMap.set("/" + lib, decompressFromUTF16(cached as string))
    } else {
      missing.push(lib)
    }
  }

  if (missing.length > 0) {
    const fetched = await createDefaultMapFromCDN(
      { target: ts.ScriptTarget.ES2022 },
      TS_LIB_VERSION,
      true,
      ts,
      { compressToUTF16, decompressFromUTF16 } as any,
    )
    for (const [filename, content] of fetched) {
      fsMap.set(filename, content)
      await set(
        CACHE_PREFIX + filename.replace(/^\//, ""),
        compressToUTF16(content),
      )
    }
  }

  return fsMap
}

/**
 * Cache key generator for package dependencies
 */
function getPackageCacheKey(url: string): string {
  // Create a hash-like key from the URL for better organization
  // Use encodeURIComponent to handle non-Latin1 characters safely
  const urlHash = btoa(encodeURIComponent(url))
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 32)
  return `${PACKAGE_CACHE_PREFIX}${CACHE_VERSION}-${urlHash}`
}

/**
 * Cache a package dependency
 */
export async function cachePackageDependency(
  url: string,
  content: string,
): Promise<void> {
  try {
    const cacheKey = getPackageCacheKey(url)
    const compressed = compressToUTF16(content)
    await set(cacheKey, compressed)
  } catch (error) {
    console.warn("Failed to cache package dependency:", error)
  }
}

/**
 * Retrieve a cached package dependency
 */
export async function getCachedPackageDependency(
  url: string,
): Promise<string | null> {
  try {
    const cacheKey = getPackageCacheKey(url)
    const compressed = await get(cacheKey)
    if (compressed && typeof compressed === "string") {
      return decompressFromUTF16(compressed)
    }
    return null
  } catch (error) {
    console.warn("Failed to retrieve cached package dependency:", error)
    return null
  }
}

/**
 * Create a caching fetch wrapper for ATA
 */
export function createCachingFetcher(
  originalFetch: typeof fetch = fetch,
): typeof fetch {
  const cachingFetcher = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString()

    // Only cache package dependencies, not all requests
    const isPackageDependency =
      url.includes("data.jsdelivr.com") ||
      url.includes("cdn.jsdelivr.net") ||
      url.includes("unpkg.com") ||
      url.includes("@types/") ||
      url.includes("@tsci/")

    if (
      isPackageDependency &&
      (!init || init.method === "GET" || !init.method)
    ) {
      // Try to get from cache first
      const cached = await getCachedPackageDependency(url)
      if (cached) {
        console.log(`📦 Cache hit for ${url}`)
        return new Response(cached, {
          status: 200,
          statusText: "OK (cached)",
          headers: {
            "Content-Type": "application/javascript",
          },
        })
      }
    }

    // If not cached or not a package dependency, fetch normally
    const response = await originalFetch(input, init)

    // Cache successful package dependency responses
    if (isPackageDependency && response.ok && response.status === 200) {
      // Clone the response before consuming it to handle caching failures
      const responseClone = response.clone()

      try {
        const content = await response.text()
        await cachePackageDependency(url, content)
        console.log(`💾 Cached ${url}`)

        // Return a new response with the content since we consumed the original
        return new Response(content, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })
      } catch (error) {
        console.warn("Failed to cache response:", error)
        // Return the cloned response since the original was consumed
        return responseClone
      }
    }

    return response
  }

  // Copy over all properties from the original fetch to maintain compatibility
  Object.setPrototypeOf(cachingFetcher, originalFetch)
  Object.assign(cachingFetcher, originalFetch)

  return cachingFetcher as typeof fetch
}
