export function setupBuildWatcher() {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="tscircuit-build"]',
  )
  const currentId = meta?.content || ""
  ;(window as any).TSC_BUILD_ID = currentId

  async function fetchBuildId(): Promise<string | null> {
    try {
      const res = await fetch("/api/generated-index", { cache: "no-store" })
      const text = await res.text()
      const match = text.match(
        /<meta name="tscircuit-build" content="([^"]+)"/i,
      )
      return match ? match[1] : null
    } catch (err) {
      console.error("Failed to fetch build identifier", err)
      return null
    }
  }

  async function checkForUpdate() {
    const serverId = await fetchBuildId()
    if (serverId && serverId !== (window as any).TSC_BUILD_ID) {
      if (confirm("A new version of tscircuit.com is available. Reload?")) {
        window.location.reload()
      }
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      checkForUpdate()
    }
  })

  setInterval(checkForUpdate, 5 * 60 * 1000)
}
