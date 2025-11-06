import axios from "redaxios"
import { useMemo } from "react"
import { jwtDecode } from "jwt-decode"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { ToastContent, useToast } from "./use-toast"
import { useSignIn } from "./use-sign-in"

// Track if we've already shown the 401 toast to prevent duplicates
let has401ToastBeenShown = false
let toastResetTimer: NodeJS.Timeout | null = null

export const useAxios = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)
  const { toastLibrary } = useToast()
  const signIn = useSignIn()
  return useMemo(() => {
    const instance = axios.create({
      baseURL: snippetsBaseApiUrl,
      headers: session
        ? {
            Authorization: `Bearer ${session?.token}`,
          }
        : {},
    })

    // Wrap all instance methods to handle 401 errors
    // (redaxios doesn't support interceptors, so we need to wrap methods)
    const originalGet = instance.get.bind(instance)
    const originalPost = instance.post.bind(instance)
    const originalPut = instance.put.bind(instance)
    const originalDelete = instance.delete.bind(instance)
    const originalPatch = instance.patch.bind(instance)

    const handleError = (error: any) => {
      const status = error?.response?.status ?? error?.status

      if (status === 401 && session?.token) {
        // Decode JWT to check if it's actually expired
        try {
          const decoded = jwtDecode<{ exp?: number }>(session.token)
          const isExpired = decoded.exp && decoded.exp * 1000 < Date.now()

          if (isExpired) {
            // Clear the expired session from localStorage
            setSession(null)

            // Only show toast once to avoid spam
            if (!has401ToastBeenShown) {
              has401ToastBeenShown = true

              // Clear any existing timer to prevent race conditions
              if (toastResetTimer) {
                clearTimeout(toastResetTimer)
              }

              // Show sign-out notification
              toastLibrary.custom(
                (t) => (
                  <ToastContent
                    title={"Signed Out"}
                    description={"Your session has expired"}
                    variant={"destructive"}
                    t={t}
                  />
                ),
                {
                  position: "top-center",
                  duration: 3000,
                },
              )

              // Show sign-in prompt
              toastLibrary.custom(
                (t) => (
                  <div onClick={() => signIn()} className="cursor-pointer">
                    <ToastContent
                      title={"Sign In Required"}
                      description={"Click here to sign in again"}
                      variant={"default"}
                      t={t}
                    />
                  </div>
                ),
                {
                  position: "top-center",
                  duration: 5000,
                },
              )

              // Reset the flag after a delay so future 401s can show toast again
              toastResetTimer = setTimeout(() => {
                has401ToastBeenShown = false
                toastResetTimer = null
              }, 6000)
            }
          }
        } catch (decodeError) {
          // If JWT decode fails, it's an invalid token - clear it
          console.error("Failed to decode JWT:", decodeError)
          setSession(null)

          // Only show toast once to avoid spam
          if (!has401ToastBeenShown) {
            has401ToastBeenShown = true

            // Clear any existing timer to prevent race conditions
            if (toastResetTimer) {
              clearTimeout(toastResetTimer)
            }

            // Show sign-out notification
            toastLibrary.custom(
              (t) => (
                <ToastContent
                  title={"Signed Out"}
                  description={"Invalid session token"}
                  variant={"destructive"}
                  t={t}
                />
              ),
              {
                position: "top-center",
                duration: 3000,
              },
            )

            // Show sign-in prompt
            toastLibrary.custom(
              (t) => (
                <div onClick={() => signIn()} className="cursor-pointer">
                  <ToastContent
                    title={"Sign In Required"}
                    description={"Click here to sign in again"}
                    variant={"default"}
                    t={t}
                  />
                </div>
              ),
              {
                position: "top-center",
                duration: 5000,
              },
            )

            // Reset the flag after a delay so future 401s can show toast again
            toastResetTimer = setTimeout(() => {
              has401ToastBeenShown = false
              toastResetTimer = null
            }, 6000)
          }
        }
      }

      throw error
    }

    instance.get = (async (...args: Parameters<typeof originalGet>) => {
      try {
        return await originalGet(...args)
      } catch (error) {
        return handleError(error)
      }
    }) as typeof originalGet

    instance.post = (async (...args: Parameters<typeof originalPost>) => {
      try {
        return await originalPost(...args)
      } catch (error) {
        return handleError(error)
      }
    }) as typeof originalPost

    instance.put = (async (...args: Parameters<typeof originalPut>) => {
      try {
        return await originalPut(...args)
      } catch (error) {
        return handleError(error)
      }
    }) as typeof originalPut

    instance.delete = (async (...args: Parameters<typeof originalDelete>) => {
      try {
        return await originalDelete(...args)
      } catch (error) {
        return handleError(error)
      }
    }) as typeof originalDelete

    instance.patch = (async (...args: Parameters<typeof originalPatch>) => {
      try {
        return await originalPatch(...args)
      } catch (error) {
        return handleError(error)
      }
    }) as typeof originalPatch

    return instance
  }, [session?.token])
}
