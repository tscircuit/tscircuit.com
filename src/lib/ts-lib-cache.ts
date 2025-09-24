import {
  createDefaultMapFromCDN,
  knownLibFilesForCompilerOptions,
} from "@typescript/vfs"
import { get, set } from "idb-keyval"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"
import ts from "typescript"

const TS_LIB_VERSION = "5.6.3"
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function loadDefaultLibMap(): Promise<Map<string, string>> {
  const fsMap = new Map<string, string>()
  const libs = knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2022 },
    ts,
  )
  const missing: string[] = []

  for (const lib of libs) {
    const cacheKey = `ts-lib-${TS_LIB_VERSION}-${lib}`
    const cached = await get(cacheKey)
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
      const cacheKey = `ts-lib-${TS_LIB_VERSION}-${filename.replace(/^\//, "")}`
      await set(cacheKey, compressToUTF16(content))
    }
  }

  return fsMap
}

export async function fetchWithPackageCaching(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString()

  // Only cache GET requests for packages
  if (init?.method && init.method !== "GET") {
    return fetch(input, init)
  }

  // Check if this should be cached
  const shouldCache = url.includes("jsdelivr.net") ||
                     url.includes("unpkg.com") ||
                     url.includes("@types/") ||
                     url.includes("@tsci/")

  if (!shouldCache) {
    return fetch(input, init)
  }

  const cacheKey = `package-cache-${url}`

  // Check cache
  const cached = await get(cacheKey).catch(() => null)
  if (cached) {
    const { data, timestamp } = cached as { data: string; timestamp: number }
    if (Date.now() - timestamp < CACHE_TTL) {
      return new Response(decompressFromUTF16(data), {
        status: 200,
        statusText: "OK"
      })
    }
  }

  // Handle @tsci packages
  let fetchUrl = url
  if (url.includes("@tsci/") && url.includes("jsdelivr.net")) {
    const packagePath = url.replace("https://cdn.jsdelivr.net/npm/@tsci/", "")
    const apiUrl = import.meta.env.VITE_SNIPPETS_API_URL ?? "/api"
    fetchUrl = `${apiUrl}/snippets/download?jsdelivr_path=${encodeURIComponent(packagePath)}`
  }

  // Fetch and cache
  const response = await fetch(fetchUrl, init)
  if (response.ok) {
    const text = await response.text()
    const compressed = compressToUTF16(text)
    await set(cacheKey, { data: compressed, timestamp: Date.now() }).catch(() => {})
    return new Response(text, response)
  }

  return response
}