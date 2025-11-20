import { useEffect, useMemo } from "react"
import { getPlatformConfig } from "@tscircuit/eval"

export function usePlatformConfig(
  fsMap?: Record<string, string | ArrayBuffer>,
) {
  const basePlatformConfig = useMemo(() => getPlatformConfig(), [])

  const kicadModBlobUrlMap = useMemo(() => {
    const map = new Map<string, string>()

    Object.entries(fsMap ?? {}).forEach(([path, content]) => {
      if (!path.endsWith(".kicad_mod")) return

      const normalizedPath = path.startsWith("/") ? path.slice(1) : path
      const blobContent =
        typeof content === "string" ? content : new Uint8Array(content)
      const blobUrl = URL.createObjectURL(
        new Blob([blobContent], { type: "text/plain" }),
      )

      map.set(normalizedPath, blobUrl)

      const basename = normalizedPath.split("/").pop()
      if (basename) {
        map.set(basename, blobUrl)
      }
    })

    return map
  }, [fsMap])

  useEffect(() => {
    return () => {
      kicadModBlobUrlMap.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [kicadModBlobUrlMap])

  return useMemo(() => {
    const baseResolveStaticImport =
      basePlatformConfig.resolveProjectStaticFileImportUrl

    const normalizePath = (path: string) => {
      let parsedPath = path

      try {
        parsedPath = new URL(path, window.location.href).pathname
      } catch (error) {
        console.error("Failed to parse static file import URL", error)
      }

      return parsedPath.replace(/^\.\//, "").replace(/^\//, "")
    }

    return {
      ...basePlatformConfig,
      resolveProjectStaticFileImportUrl: async (path: string) => {
        const normalizedPath = normalizePath(path)

        if (normalizedPath.endsWith(".kicad_mod")) {
          const blobUrl =
            kicadModBlobUrlMap.get(normalizedPath) ||
            kicadModBlobUrlMap.get(normalizedPath.split("/").pop() ?? "")

          if (blobUrl) return blobUrl
        }

        if (baseResolveStaticImport) {
          return baseResolveStaticImport(path)
        }

        return path
      },
    }
  }, [basePlatformConfig, kicadModBlobUrlMap])
}
