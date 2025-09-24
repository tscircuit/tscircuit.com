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
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

interface CachedData {
  content: string
  timestamp: number
}

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
 * djb2 hash algorithm - fast and effective for string hashing
 * Generates unique cache keys from URLs to prevent collisions
 */
function djb2Hash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Cache key generator for package dependencies
 */
function getPackageCacheKey(url: string): string {
  // Use proper hashing to avoid collision issues with URL prefixes
  const urlHash = djb2Hash(url)
  return `${PACKAGE_CACHE_PREFIX}${urlHash}`
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
    const cachedData: CachedData = {
      content: compressToUTF16(content),
      timestamp: Date.now(),
    }
    await set(cacheKey, cachedData)
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
    const cachedData = (await get(cacheKey)) as CachedData | undefined

    if (!cachedData) {
      return null
    }

    // Check if cache has expired
    const isExpired = Date.now() - cachedData.timestamp > CACHE_TTL_MS
    if (isExpired) {
      // Clean up expired cache entry
      await set(cacheKey, undefined)
      return null
    }

    return decompressFromUTF16(cachedData.content)
  } catch (error) {
    console.warn("Failed to retrieve cached package dependency:", error)
    return null
  }
}

/**
 * Fetch with automatic package dependency caching
 */
export async function fetchWithPackageCaching(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString()

  // Only cache package dependencies, not all requests
  const isPackageDependency =
    url.includes("data.jsdelivr.com") ||
    url.includes("cdn.jsdelivr.net") ||
    url.includes("unpkg.com") ||
    url.includes("@types/") ||
    url.includes("@tsci/")

  if (isPackageDependency && (!init || init.method === "GET" || !init.method)) {
    // Try to get from cache first
    const cached = await getCachedPackageDependency(url)
    if (cached) {
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
  const response = await fetch(input, init)

  // Cache successful package dependency responses
  if (isPackageDependency && response.ok && response.status === 200) {
    // Clone the response before consuming it to handle caching failures
    const responseClone = response.clone()

    try {
      const content = await response.text()
      await cachePackageDependency(url, content)

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
