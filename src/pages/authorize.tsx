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
  const searchParams = new URLSearchParams(window.location.search)
  const session_token = searchParams.get("session_token") || ""
  useEffect(() => {
    async function login() {
      try {
        if (!session_token) {
          setMessage("couldn't log in - no token")
          return
        }
        const decodedToken = jose.decodeJwt(session_token)
        setSession({
          ...(decodedToken as any),
          token: session_token,
        })
        setLocation("/")
        return
      } catch (e) {
        console.error("Login error:", e)
        setMessage(`error logging you in: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    login()
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
