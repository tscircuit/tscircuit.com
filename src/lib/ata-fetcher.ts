/**
 * ATA fetcher that blocks requests during save operations
 */

export class AtaSaveBlocker {
  private isSaving = false
  
  setSaving(saving: boolean) {
    this.isSaving = saving
  }

  createFetcher(apiUrl: string) {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      // Block requests during save to prevent spam
      if (this.isSaving) {
        return new Response('{}', { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      }
      
      const url = typeof input === "string" ? input : input.toString()
      return this.fetchFromTsciCdn(url, apiUrl, init)
    }
  }

  private async fetchFromTsciCdn(url: string, apiUrl: string, init?: RequestInit): Promise<Response> {
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
  }
}