import { QueryClient, QueryClientProvider } from "react-query"
import { HelmetProvider } from "react-helmet-async"
import { useEffect } from "react"
import { useGlobalStore } from "./hooks/use-global-store"
import { posthog } from "./lib/posthog"
import { Toaster } from "react-hot-toast"

const staffGithubUsernames = [
  "imrishabh18",
  "seveibar",
  "testuser",
  ...(import.meta.env.VITE_STAFF_GITHUB_USERNAMES?.split(",") || []),
]

const queryClient = new QueryClient()

const isInternalGithubUser = (githubUsername?: string | null) => {
  if (!githubUsername) return false
  return staffGithubUsernames.some(
    (internalGithubUsername: string) =>
      internalGithubUsername.toLowerCase() === githubUsername.toLowerCase(),
  )
}

function PostHogIdentifier() {
  const session = useGlobalStore((s) => s.session)

  useEffect(() => {
    if (!posthog.__loaded) {
      const checkInterval = setInterval(() => {
        if (posthog.__loaded) {
          clearInterval(checkInterval)
          identifyUser()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    const identifyUser = async () => {
      try {
        const githubUsername = session?.github_username

        if (isInternalGithubUser(githubUsername)) {
          posthog.identify(session?.github_username, {
            is_tscircuit_staff: true,
          })
        }
      } catch (error) {
        // Error handling silently fails
      }
    }

    identifyUser()
  }, [session])

  return null
}

export const ContextProviders = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <PostHogIdentifier />
        {children}
        <Toaster />
      </HelmetProvider>
    </QueryClientProvider>
  )
}
