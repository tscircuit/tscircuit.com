"use client"

import Header from "@/components/Header"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useEffect, useState } from "react"
import * as jose from "jose"
import Footer from "@/components/Footer"
import { useLocation } from "wouter"
import { useIsUsingFakeApi } from "@/hooks/use-is-using-fake-api"

const handleRedirect = (
  redirect: string | null,
  fallbackLocation: () => void,
) => {
  if (redirect) {
    try {
      const decodedRedirect = decodeURIComponent(redirect)

      if (decodedRedirect.startsWith("/")) {
        window.location.href = decodedRedirect
        return
      }

      const redirectUrl = new URL(decodedRedirect)
      if (redirectUrl.origin === window.location.origin) {
        window.location.href = redirectUrl.href
        return
      }
    } catch (e) {
      console.warn("Invalid redirect URL:", redirect)
    }
  }
  fallbackLocation()
}

const AuthenticatePageInnerContent = () => {
  const [location, setLocation] = useLocation()
  const setSession = useGlobalStore((s) => s.setSession)
  const [message, setMessage] = useState("logging you in...")
  const searchParams = new URLSearchParams(window.location.search.split("?")[1])
  const session_token = searchParams.get("session_token")
  const redirect = searchParams.get("redirect")
  const isUsingFakeApi = useIsUsingFakeApi()
  useEffect(() => {
    async function login() {
      if (isUsingFakeApi) {
        setSession({
          account_id: "account-1234",
          github_username: "testuser",
          token: "1234",
          session_id: "session-1234",
        })

        handleRedirect(redirect, () => setLocation("/"))
        return
      }
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
        handleRedirect(redirect, () => setLocation("/"))
        return
      }
    }
    login().catch((e) => {
      setMessage(`error logging you in\n\n${e.toString()}`)
    })
  }, [session_token, redirect])

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
