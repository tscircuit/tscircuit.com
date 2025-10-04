import { useEffect, useState } from "react"
import { Redirect } from "wouter"

import { FullPageLoader } from "@/App"
import { useGlobalStore } from "@/hooks/use-global-store"

const SettingsRedirectPage = () => {
  const session = useGlobalStore((state) => state.session)
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

  if (!hasHydrated) {
    return <FullPageLoader />
  }

  if (!session?.github_username) {
    return <Redirect to="/" />
  }

  return <Redirect to={`/${session.github_username}/settings`} />
}

export default SettingsRedirectPage
