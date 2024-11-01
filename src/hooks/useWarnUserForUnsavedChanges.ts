import { useEffect } from "react"
export default function useWarnUserForUnsavedChanges({
  hasUnsavedChanges,
}: {
  hasUnsavedChanges: boolean
}) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = "" // Shows the confirmation dialog on reload or close if there are unsaved changes
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges) {
        const userConfirmed = window.confirm(
          "Are you sure you want to go back? Unsaved changes may be lost.",
        )
        if (!userConfirmed) {
          // Push the state again to stay on the same page
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    // Attach event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push the initial state only once, when component mounts
    if (hasUnsavedChanges) {
      window.history.pushState(null, "", window.location.href)
    }

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [hasUnsavedChanges])
}
