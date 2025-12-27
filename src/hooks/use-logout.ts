import { useState } from "react"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"

export const useLogout = () => {
  const axios = useAxios()
  const setSession = useGlobalStore((s) => s.setSession)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleLogout = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await axios.post("/sessions/delete")
    } catch (error) {
      console.error("Failed to sign out", error)
    } finally {
      setSession(null)
      setIsSigningOut(false)
    }
  }

  return {
    handleLogout,
    isSigningOut,
  }
}
