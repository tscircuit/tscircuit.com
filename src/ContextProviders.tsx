import { QueryClient, QueryClientProvider } from "react-query"
import { HelmetProvider } from "react-helmet-async"
import { useEffect } from "react"
import { useGlobalStore } from "./hooks/use-global-store"
import { posthog } from "./lib/posthog"
import { Toaster } from "react-hot-toast"
import { populateQueryCacheWithSSRData } from "./lib/populate-query-cache-with-ssr-data"

const staffGithubUsernames = [
  "imrishabh18",
  "seveibar",
  "testuser",
  ...(import.meta.env.VITE_STAFF_GITHUB_USERNAMES?.split(",") || []),
]

const queryClient = new QueryClient()
populateQueryCacheWithSSRData(queryClient)

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
    const identifyUser = async () => {
      try {
        const githubUsername = session?.github_username

        if (isInternalGithubUser(githubUsername)) {
          posthog.identify(session?.github_username, {
            is_tscircuit_staff: true,
          })
        }
      } catch (error) {
        console.error("Failed to identify PostHog user:", error)
      }
    }

    if (!posthog.__loaded) {
      const checkInterval = setInterval(() => {
        if (posthog.__loaded) {
          clearInterval(checkInterval)
          identifyUser()
        }
      }, 100)
      
      // Cleanup function to prevent memory leak
      return () => clearInterval(checkInterval)
    } else {
      // PostHog is already loaded, identify immediately
      identifyUser()
    }
  }, [session])

  return null
}

export const ContextProviders = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <PostHogIdentifier />
        {children}
        <Toaster position="bottom-right" />
      </HelmetProvider>
    </QueryClientProvider>
  )
}
