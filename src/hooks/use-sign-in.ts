import { useGlobalStore } from "./use-global-store"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

export const useSignIn = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const isUsingFakeApi = useIsUsingFakeApi()
  const setSession = useGlobalStore((s) => s.setSession)
  return () => {
    if (!isUsingFakeApi) {
      window.location.href = `${snippetsBaseApiUrl}/internal/oauth/github/authorize?next=${window.location.origin}/authorize`
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
