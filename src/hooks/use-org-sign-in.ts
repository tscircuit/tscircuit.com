import { useCallback } from "react"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"

export type OrgAuthProvider = "google" | "github"

export const getOrgLoginRedirectPath = () => {
  if (typeof window === "undefined") return "/"
  const searchParams = new URLSearchParams(window.location.search)
  const redirectParam = searchParams.get("redirect")
  if (redirectParam && redirectParam.startsWith("/")) {
    return redirectParam
  }
  return "/"
}

export const useOrgSignIn = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const isUsingFakeApi = useIsUsingFakeApi()

  return useCallback(
    (provider: OrgAuthProvider, customRedirect?: string) => {
      const normalizedProvider: OrgAuthProvider =
        provider === "github" ? "github" : "google"
      const replaceHost = (value: string) =>
        value.replace("127.0.0.1", "localhost")
      const origin = replaceHost(window.location.origin)
      const redirectPath = customRedirect || getOrgLoginRedirectPath()
      const redirectUrl = `${origin}${redirectPath}`
      const nextUrl = `${origin}/authorize?redirect=${encodeURIComponent(redirectUrl)}${isUsingFakeApi && normalizedProvider === "google" ? "&workos=true" : ""}`

      if (isUsingFakeApi) {
        window.location.href = nextUrl
        return
      }

      const url = new URL(`${snippetsBaseApiUrl}/internal/workos/initiate-auth`)
      url.searchParams.set("provider", normalizedProvider)
      url.searchParams.set("next", nextUrl)
      window.location.href = url.toString()
    },
    [snippetsBaseApiUrl, isUsingFakeApi],
  )
}
