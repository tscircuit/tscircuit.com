import { useCallback } from "react"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"

export type OrgAuthProvider = "google" | "github"

export const useOrgSignIn = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const isUsingFakeApi = useIsUsingFakeApi()

  return useCallback(
    (provider: OrgAuthProvider) => {
      const normalizedProvider: OrgAuthProvider =
        provider === "github" ? "github" : "google"
      const replaceHost = (value: string) =>
        value.replace("127.0.0.1", "localhost")
      const currentUrl = replaceHost(window.location.href)
      const origin = replaceHost(window.location.origin)
      const nextUrl = `${origin}/authorize?redirect=${encodeURIComponent(currentUrl)}`

      if (isUsingFakeApi) {
        window.location.href = nextUrl
        return
      }

      const url = new URL(
        `${snippetsBaseApiUrl}/internal/workos/initiate-auth`,
      )
      url.searchParams.set("provider", normalizedProvider)
      url.searchParams.set("next", nextUrl)
      window.location.href = url.toString()
    },
    [snippetsBaseApiUrl, isUsingFakeApi],
  )
}
