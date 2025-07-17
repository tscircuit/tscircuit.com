import {
  createDefaultMapFromCDN,
  knownLibFilesForCompilerOptions,
} from "@typescript/vfs"
import { get, set } from "idb-keyval"
import { compressToUTF16, decompressFromUTF16 } from "lz-string"
import ts from "typescript"

const TS_LIB_VERSION = "5.6.3"
const CACHE_PREFIX = `ts-lib-${TS_LIB_VERSION}-`

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
      fsMap.set(`/${lib}`, decompressFromUTF16(cached as string))
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
