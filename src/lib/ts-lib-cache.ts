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

function djb2Hash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
export async function fetchWithPackageCaching(
  input: RequestInfo | URL,
  init?: RequestInit,
  apiUrl?: string,
): Promise<Response> {
  let finalInput = input

  // Handle @tsci registry redirects
  if (typeof input === "string" && input.includes("@tsci/") && apiUrl) {
    const registryPrefixes = [
      "https://data.jsdelivr.com/v1/package/resolve/npm/@tsci/",
      "https://data.jsdelivr.com/v1/package/npm/@tsci/",
      "https://cdn.jsdelivr.net/npm/@tsci/",
    ]
    const matchedPrefix = registryPrefixes.find((prefix) =>
      input.startsWith(prefix),
    )
    if (matchedPrefix) {
      const packagePath = input.replace(matchedPrefix, "")
      const [packageName, ...pathParts] = packagePath.split("/")
      const jsdelivrPath = [packageName.replace(/\./g, "/"), ...pathParts].join(
        "/",
      )
      finalInput = `${apiUrl}/snippets/download?jsdelivr_resolve=${input.includes("/resolve/")}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`
    }
  }

  const url =
    typeof finalInput === "string"
      ? finalInput
      : finalInput instanceof URL
        ? finalInput.toString()
        : (finalInput as Request).url

  const isPackageDependency =
    url.includes("data.jsdelivr.com") ||
    url.includes("cdn.jsdelivr.net") ||
    url.includes("unpkg.com") ||
    url.includes("@types/") ||
    url.includes("@tsci/")

  if (isPackageDependency && (!init || init.method === "GET" || !init.method)) {
    const cacheKey = `${PACKAGE_CACHE_PREFIX}${djb2Hash(url)}`
    const cachedData = (await get(cacheKey)) as CachedData | undefined

    if (cachedData && Date.now() - cachedData.timestamp <= CACHE_TTL_MS) {
      return new Response(decompressFromUTF16(cachedData.content), {
        status: 200,
        statusText: "OK (cached)",
        headers: { "Content-Type": "application/javascript" },
      })
    }
  }

  const response = await fetch(finalInput, init)

  if (isPackageDependency && response.ok && response.status === 200) {
    const responseClone = response.clone()
    try {
      const content = await response.text()
      const cacheKey = `${PACKAGE_CACHE_PREFIX}${djb2Hash(url)}`
      await set(cacheKey, {
        content: compressToUTF16(content),
        timestamp: Date.now(),
      })
      return new Response(content, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    } catch {
      return responseClone
    }
  }

  return response
}
