import { useEffect, useState } from "react"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useHydration = () => {
  const [hasHydrated, setHasHydrated] = useState(() => {
    if (typeof window === "undefined") return false
    return useGlobalStore.persist?.hasHydrated?.() ?? false
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    if (useGlobalStore.persist?.hasHydrated?.()) {
      setHasHydrated(true)
      return
    }

    const unsubFinishHydration = useGlobalStore.persist?.onFinishHydration?.(
      () => {
        setHasHydrated(true)
      },
    )

    return () => {
      unsubFinishHydration?.()
    }
  }, [])

  return hasHydrated
}
