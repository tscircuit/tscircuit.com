import { useCallback, useEffect, useRef } from "react"

/**
 * Hook for creating ATA fetcher that routes @tsci packages through local API
 */
export function useAtaFetcher(apiUrl: string) {
  return useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString()
    
    // Debug: Log every ATA request to understand the pattern
    console.log(`[ATA FETCH] ${url}`)
    
    const tsciPrefixes = [
      "https://data.jsdelivr.com/v1/package/resolve/npm/@tsci/",
      "https://data.jsdelivr.com/v1/package/npm/@tsci/",
      "https://cdn.jsdelivr.net/npm/@tsci/",
    ]

    const matchedPrefix = tsciPrefixes.find(prefix => url.startsWith(prefix))
    
    if (matchedPrefix) {
      const packagePath = url.replace(matchedPrefix, "")
      const packageName = packagePath.split("/")[0].replace(/\./, "/")
      const pathInPackage = packagePath.split("/").slice(1).join("/")
      const jsdelivrPath = `${packageName}${pathInPackage ? `/${pathInPackage}` : ""}`
      
      return fetch(
        `${apiUrl}/snippets/download?jsdelivr_resolve=${url.includes("/resolve/")}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`,
      )
    }

    return fetch(url, init)
  }, [apiUrl])
}

/**
 * Hook that manages ATA calls and prevents excessive requests during save operations
 */
export function useAtaManager(
  ataRef: React.RefObject<((code: string) => void) | null>,
  code: string,
  defaultImports: string,
  currentFile: string | null,
  isSaving: boolean
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastCodeRef = useRef<string>("")
  
  useEffect(() => {
    console.log(`[ATA MANAGER] Effect triggered - isSaving: ${isSaving}, currentFile: ${currentFile}`)
    
    // Don't trigger ATA during save operations
    if (isSaving) {
      console.log(`[ATA MANAGER] BLOCKING ATA - save in progress`)
      // Clear any pending ATA calls
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }
    
    // Only trigger ATA for TypeScript files
    if (!ataRef.current || !currentFile?.endsWith(".tsx") && !currentFile?.endsWith(".ts")) {
      console.log(`[ATA MANAGER] Skipping - no ATA ref or not TS file`)
      return
    }
    
    const fullCode = `${defaultImports}${code}`
    
    // Skip if code hasn't actually changed
    if (fullCode === lastCodeRef.current) {
      console.log(`[ATA MANAGER] Skipping - code unchanged`)
      return
    }
    
    console.log(`[ATA MANAGER] Scheduling ATA call`)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce ATA calls
    timeoutRef.current = setTimeout(() => {
      if (ataRef.current && !isSaving) {
        console.log(`[ATA MANAGER] Executing ATA call`)
        lastCodeRef.current = fullCode
        ataRef.current(fullCode)
      } else {
        console.log(`[ATA MANAGER] Cancelled ATA call - no ref or saving`)
      }
    }, 500)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [ataRef, code, defaultImports, currentFile, isSaving])
}