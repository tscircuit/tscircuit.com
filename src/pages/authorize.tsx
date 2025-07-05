"use client"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useIsUsingFakeApi } from "@/hooks/use-is-using-fake-api"
import * as jose from "jose"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation } from "wouter"

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

  const isError = message.includes("error") || message.includes("couldn't")
  const isSuccess =
    message.includes("success") || message.includes("redirecting")

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
        setMessage("couldn't log in - no token provided")
        return
      }
      if (session_token) {
        const decodedToken = jose.decodeJwt(session_token)
        setSession({
          ...(decodedToken as any),
          token: session_token,
        })
        setMessage("success! redirecting you now...")
        setTimeout(() => {
          handleRedirect(redirect, () => setLocation("/"))
        }, 1000)
        return
      }
    }
    login().catch((e) => {
      setMessage(`error logging you in: ${e.message || e.toString()}`)
    })
  }, [session_token, redirect])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-50/20 rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center">
            <div className="mb-6">
              {isError ? (
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              ) : isSuccess ? (
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {isError
                ? "Authentication Failed"
                : isSuccess
                  ? "Success!"
                  : "Signing You In"}
            </h1>

            {/* Message */}
            <div className="text-gray-600">
              {isError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-red-800 font-medium mb-2">
                    Authentication Error
                  </p>
                  <p className="text-red-700 text-sm break-words">{message}</p>
                  <div className="mt-4 pt-3 border-t border-red-200">
                    <p className="text-red-600 text-xs">
                      Please try signing in again or contact support if the
                      problem persists.
                    </p>
                  </div>
                </div>
              ) : isSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    Authentication successful!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Redirecting you now...
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    Please wait while we authenticate your account and redirect
                    you to your destination.
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="ml-2">Processing</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-gray-500">
          If you encounter any issues, please report them on our{" "}
          <a
            href="https://github.com/tscircuit/tscircuit/issues"
            className="text-blue-500 underline"
          >
            GitHub Issues page
          </a>
          .
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes pulse-loading {
            0% {
              width: 0%;
            }
            50% {
              width: 60%;
            }
            100% {
              width: 100%;
            }
          }
          .animate-pulse-loading {
            animation: pulse-loading 2s ease-in-out infinite;
          }
        `,
        }}
      />
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
