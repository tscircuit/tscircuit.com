import { useCallback } from "react"
import { useGlobalStore } from "./use-global-store"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

export const useSignIn = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const isUsingFakeApi = useIsUsingFakeApi()
  const setSession = useGlobalStore((s) => s.setSession)

  return useCallback(() => {
    if (!isUsingFakeApi) {
      const nextPath = "/authorize"
      const nextUrl = encodeURIComponent(
        window.location.origin.replace("127.0.0.1", "localhost") + nextPath,
      )
      window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${nextUrl}`
    } else {
      setSession({
        account_id: "account-1234",
        github_username: "testuser",
        token: "1234",
        session_id: "session-1234",
      })
    }
  }, [snippetsBaseApiUrl, isUsingFakeApi, setSession])
}
