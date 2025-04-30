import { useGlobalStore } from "./use-global-store"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

export const useSignIn = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const isUsingFakeApi = useIsUsingFakeApi()
  const setSession = useGlobalStore((s) => s.setSession)
  return () => {
    if (!isUsingFakeApi) {
      const currentPath = window.location.pathname + window.location.search
      // Store current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath)
      const nextUrl = window.location.origin.replace("127.0.0.1", "localhost")
      window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${nextUrl}/authorize`
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
