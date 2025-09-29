import { Package } from "fake-snippets-api/lib/db/schema"
import { useEffect, useRef } from "react"

export default function useWarnUserOnPageChange({
  hasUnsavedChanges,
  pkg,
}: {
  hasUnsavedChanges: boolean
  pkg?: Package
}) {
  const originalTitleRef = useRef<string>("")

  useEffect(() => {
    if (!hasUnsavedChanges || !originalTitleRef.current) {
      originalTitleRef.current = document.title.replace(/^⚠️\s*/, "")
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?"
        event.preventDefault()
        event.returnValue = message
        return message
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges) {
        if (!document.title.startsWith("⚠️")) {
          document.title = "⚠️ " + originalTitleRef.current
        }
      } else if (!document.hidden) {
        document.title = originalTitleRef.current
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges && Boolean(pkg)) {
        const shouldLeave = window.confirm(
          "You have unsaved changes. Are you sure you want to leave this page?2",
        )
        if (!shouldLeave) {
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    const handleLinkClick = (event: MouseEvent) => {
      if (!hasUnsavedChanges) return

      const target = event.target as HTMLElement
      const link = target.closest("a[href]") as HTMLAnchorElement

      if (link && link.href) {
        try {
          const linkUrl = new URL(link.href)
          const currentUrl = new URL(window.location.href)

          if (linkUrl.origin === currentUrl.origin) {
            event.preventDefault()
            event.stopPropagation()

            const shouldLeave = window.confirm(
              "You have unsaved changes. Are you sure you want to leave this page?",
            )

            if (shouldLeave) {
              window.location.href = link.href
            }
          }
        } catch (error) {
          console.warn("Failed to parse link URL:", error)
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("popstate", handlePopState)
    document.addEventListener("click", handleLinkClick, true)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("popstate", handlePopState)
      document.removeEventListener("click", handleLinkClick, true)
      document.title = originalTitleRef.current
    }
  }, [hasUnsavedChanges])
}
