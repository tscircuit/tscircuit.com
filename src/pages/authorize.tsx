"use client"

import Header from "@/components/Header"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useEffect, useState } from "react"
import * as jose from "jose"
import Footer from "@/components/Footer"
import { useLocation } from "wouter"

const AuthenticatePageInnerContent = () => {
  const [location, setLocation] = useLocation()
  const setSession = useGlobalStore((s) => s.setSession)
  const [message, setMessage] = useState("logging you in...")
  const searchParams = new URLSearchParams(window.location.search.split("?")[1])
  const session_token = searchParams.get("session_token")
  useEffect(() => {
    async function login() {
      if (!session_token) {
        setMessage("couldn't log in - no token")
        return
      }

      if (session_token) {
        const decodedToken = jose.decodeJwt(session_token)
        setSession({
          ...(decodedToken as any),
          token: session_token,
        })

        // Get the last visited URL from global store
        const lastVisitedUrl = useGlobalStore.getState().lastVisitedUrl
        // Redirect to last visited URL if available, otherwise go to home
        setLocation(lastVisitedUrl || "/")
        return
      }
    }
    login().catch((e) => {
      setMessage(`error logging you in\n\n${e.toString()}`)
    })
  }, [session_token])

  return (
    <div className="bg-white p-8 min-h-screen">
      <div>Authentication Redirect</div>
      <pre>{message}</pre>
    </div>
  )
}

export const AuthorizePage = () => (
  <div>
    <Header />
    <AuthenticatePageInnerContent />
    <Footer />
  </div>
)

export default AuthorizePage
