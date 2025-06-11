import { useGlobalStore } from "./use-global-store"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

export const useSignIn = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const isUsingFakeApi = useIsUsingFakeApi()
  const setSession = useGlobalStore((s) => s.setSession)
  return () => {
    if (!isUsingFakeApi) {
      const currentUrl = window.location.href.replace("127.0.0.1", "localhost")
      const nextUrl = `${window.location.origin.replace("127.0.0.1", "localhost")}/authorize?redirect=${encodeURIComponent(currentUrl)}`
      window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${encodeURIComponent(nextUrl)}`
    } else {
      setSession({
        account_id: "account-1234",
        github_username: "testuser",
        token: "1234",
        session_id: "session-1234",
      })
    }
  }
}
