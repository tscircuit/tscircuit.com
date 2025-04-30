"use client"

import Header from "@/components/Header"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useEffect, useState } from "react"
import * as jose from "jose"
import Footer from "@/components/Footer"
import { useLocation } from "wouter"

const AuthenticatePageInnerContent = () => {
  const [, navigate] = useLocation()
  const setSession = useGlobalStore((s) => s.setSession)
  const [message, setMessage] = useState("Logging you in...")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionToken = params.get("session_token")

    if (!sessionToken) {
      setMessage("Couldn't log in - no token provided.")
      return
    }

    try {
      const decoded: any = jose.decodeJwt(sessionToken)
      setSession({
        ...decoded,
        token: sessionToken,
      })
      navigate("/")
    } catch (error: any) {
      setMessage(`Error logging you in: ${error.message}`)
    }
  }, [setSession, navigate])

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
