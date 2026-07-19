import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "react-query"
import { HelmetProvider } from "react-helmet-async"
import { useEffect, useMemo } from "react"
import { useGlobalStore } from "./hooks/use-global-store"
import { posthog } from "./lib/posthog"
import { Toaster } from "react-hot-toast"
import { populateQueryCacheWithSSRData } from "./lib/populate-query-cache-with-ssr-data"
import { trackReactQueryApiFailure } from "./lib/react-query-api-failure-tracking"
import { TscircuitHandleRequiredDialog } from "@/components/dialogs/tscircuit-handle-required-dialog"
import { decodeTscircuitSessionJwt } from "@/lib/auth/session"
import type { Store } from "@/hooks/use-global-store"

type CrispSessionDataValue = string | number | boolean
type CrispCommand =
  | ["set", "user:email", [string]]
  | ["set", "user:nickname", [string]]
  | ["set", "user:avatar", [string]]
  | ["set", "session:data", [Array<[string, CrispSessionDataValue]>]]
  | ["do", "session:reset"]

declare global {
  interface Window {
    $crisp?: {
      push: (command: CrispCommand) => unknown
    }
  }
}

const staffGithubUsernames = [
  "imrishabh18",
  "seveibar",
  "testuser",
  ...(import.meta.env.VITE_STAFF_GITHUB_USERNAMES?.split(",") || []),
]

// Instantiated inside ContextProviders to prevent SSR memory leaks and request pollution

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
          posthog.identify(session?.github_username as string, {
            is_tscircuit_staff: true,
          })
        }
      } catch (error) {
        // Error handling silently fails
      }
    }

    if (!session) {
      try {
        posthog.reset()
      } catch (error) {
        // Silent catch to prevent analytics blocking from crashing the app
      }
      return
    }

    if (!posthog.__loaded) {
      const checkInterval = setInterval(() => {
        if (posthog.__loaded) {
          clearInterval(checkInterval)
          identifyUser()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    identifyUser()
  }, [session])

  return null
}

const addCrispSessionData = (
  data: Array<[string, CrispSessionDataValue]>,
  key: string,
  value: unknown,
) => {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    data.push([key, value])
  }
}

const getStringClaim = (
  claims: Record<string, unknown> | null | undefined,
  key: string,
) => {
  const value = claims?.[key]
  return typeof value === "string" && value.trim() ? value : null
}

const getCrispSessionData = (session: NonNullable<Store["session"]>) => {
  const decodedToken = decodeTscircuitSessionJwt(session.token)
  const decodedClaims = decodedToken as Record<string, unknown> | null
  const githubUsername =
    session.github_username ??
    decodedToken?.github_username ??
    session.tscircuit_handle ??
    decodedToken?.tscircuit_handle ??
    null
  const tscircuitHandle =
    session.tscircuit_handle ?? decodedToken?.tscircuit_handle ?? null
  const email = session.email ?? decodedToken?.email
  const displayName =
    getStringClaim(decodedClaims, "name") ??
    getStringClaim(decodedClaims, "display_name") ??
    tscircuitHandle ??
    githubUsername
  const isStaff =
    session.is_tscircuit_staff ?? decodedToken?.is_tscircuit_staff ?? false

  const sessionData: Array<[string, CrispSessionDataValue]> = []
  addCrispSessionData(sessionData, "account_id", session.account_id)
  addCrispSessionData(sessionData, "session_id", session.session_id)
  addCrispSessionData(sessionData, "name", displayName)
  addCrispSessionData(sessionData, "github_username", githubUsername)
  addCrispSessionData(sessionData, "tscircuit_handle", tscircuitHandle)
  addCrispSessionData(sessionData, "email", email)
  addCrispSessionData(sessionData, "is_tscircuit_staff", isStaff)
  addCrispSessionData(sessionData, "jwt_subject", decodedToken?.sub)

  return {
    displayName,
    email,
    githubUsername,
    sessionData,
  }
}

function CrispIdentifier() {
  const session = useGlobalStore((s) => s.session)

  useEffect(() => {
    if (typeof window === "undefined") return

    const crisp = (window.$crisp ??= [] as unknown as NonNullable<
      Window["$crisp"]
    >)

    if (!session) {
      try {
        crisp.push(["do", "session:reset"])
      } catch {
        // Crisp should not affect app behavior.
      }
      return
    }

    const { displayName, email, githubUsername, sessionData } =
      getCrispSessionData(session)

    try {
      if (email) crisp.push(["set", "user:email", [email]])
      if (displayName) {
        crisp.push(["set", "user:nickname", [displayName]])
      }
      if (githubUsername) {
        crisp.push([
          "set",
          "user:avatar",
          [`https://github.com/${githubUsername}.png`],
        ])
      }
      if (sessionData.length > 0) {
        crisp.push(["set", "session:data", [sessionData]])
      }
    } catch {
      // Crisp should not affect app behavior.
    }
  }, [session])

  return null
}

const GlobalTscircuitHandleDialog = () => {
  const dialog = useGlobalStore((s) => s.tscircuit_handle_required_dialog)
  const closeDialog = useGlobalStore(
    (s) => s.closeTscircuitHandleRequiredDialog,
  )

  return (
    <TscircuitHandleRequiredDialog
      open={dialog.open}
      onOpenChange={(open) => !open && closeDialog()}
      message={dialog.message}
    />
  )
}

export const ContextProviders = ({
  children,
}: { children: React.ReactNode }) => {
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          trackReactQueryApiFailure(error, {
            operationType: "query",
            queryKey: query.queryKey,
          })
        },
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          trackReactQueryApiFailure(error, {
            operationType: "mutation",
            mutationKey: mutation.options?.mutationKey,
          })
        },
      }),
    })
    populateQueryCacheWithSSRData(client)
    return client
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <PostHogIdentifier />
        <CrispIdentifier />
        {children}
        <Toaster position="top-center" />
        <GlobalTscircuitHandleDialog />
      </HelmetProvider>
    </QueryClientProvider>
  )
}
