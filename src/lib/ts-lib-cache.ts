import {
  createDefaultMapFromCDN,
  knownLibFilesForCompilerOptions,
} from "@typescript/vfs"
import { get, set } from "idb-keyval"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"
import ts from "typescript"

const TS_LIB_VERSION = "5.6.3"
const CACHE_PREFIX = `ts-lib-${TS_LIB_VERSION}-`
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function loadDefaultLibMap(): Promise<Map<string, string>> {
  const fsMap = new Map<string, string>()
  const libs = knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2022 },
    ts,
  )
  const missing: string[] = []

  for (const lib of libs) {
    const cacheKey = CACHE_PREFIX + lib
    const cached = await get(cacheKey)
    if (
      cached &&
      typeof cached === "object" &&
      "data" in cached &&
      "timestamp" in cached
    ) {
      const { data, timestamp } = cached as { data: string; timestamp: number }
      if (Date.now() - timestamp < CACHE_TTL) {
        fsMap.set("/" + lib, decompressFromUTF16(data))
      } else {
        missing.push(lib)
      }
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
      const cacheKey = CACHE_PREFIX + filename.replace(/^\//, "")
      const compressed = compressToUTF16(content)
      await set(cacheKey, { data: compressed, timestamp: Date.now() }).catch(
        () => {},
      )
    }
  }

  return fsMap
}

export async function fetchWithPackageCaching(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString()

  // Only cache GET requests for packages
  if (init?.method && init.method !== "GET") {
    return fetch(input, init)
  }

  // Check if this should be cached
  const shouldCache =
    url.includes("jsdelivr.net") ||
    url.includes("unpkg.com") ||
    url.includes("@types/") ||
    url.includes("@tsci/")

  if (!shouldCache) {
    return fetch(input, init)
  }

  const cacheKey = `package-cache-${url}`

  // Check cache
  const cached = await get(cacheKey).catch(() => null)
  if (
    cached &&
    typeof cached === "object" &&
    "data" in cached &&
    "timestamp" in cached
  ) {
    const { data, timestamp } = cached as { data: string; timestamp: number }
    if (Date.now() - timestamp < CACHE_TTL) {
      return new Response(decompressFromUTF16(data), {
        status: 200,
        statusText: "OK",
      })
    }
  }

  // Handle @tsci packages
  let fetchUrl = url
  if (
    url.includes("@tsci/") &&
    (url.includes("jsdelivr.net") || url.includes("data.jsdelivr.com"))
  ) {
    let packagePath = ""
    if (url.includes("jsdelivr.net")) {
      packagePath = url.replace("https://cdn.jsdelivr.net/npm/@tsci/", "")
    } else if (url.includes("/v1/package/resolve/npm/@tsci/")) {
      const resolveIndex = url.indexOf("/v1/package/resolve/npm/@tsci/")
      packagePath = url.substring(
        resolveIndex + "/v1/package/resolve/npm/@tsci/".length,
      )
    } else if (url.includes("/v1/package/npm/@tsci/")) {
      const npmIndex = url.indexOf("/v1/package/npm/@tsci/")
      packagePath = url.substring(npmIndex + "/v1/package/npm/@tsci/".length)
    }

    if (packagePath) {
      // Convert dots to slashes in the package name part (like original logic)
      const parts = packagePath.split("/")
      if (parts.length > 0) {
        parts[0] = parts[0].replace(/\./, "/")
      }
      const transformedPackagePath = parts.join("/")

      const apiUrl = import.meta.env.VITE_SNIPPETS_API_URL ?? "/api"
      const isResolve = url.includes("/resolve/")
      fetchUrl = `${apiUrl}/snippets/download?jsdelivr_resolve=${isResolve}&jsdelivr_path=${encodeURIComponent(transformedPackagePath)}`
    }
  }

  // Fetch and cache
  const response = await fetch(fetchUrl, init)
  if (response.ok) {
    const text = await response.text()
    const compressed = compressToUTF16(text)
    await set(cacheKey, { data: compressed, timestamp: Date.now() }).catch(
      () => {},
    )
    return new Response(text, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }

  return response
}
