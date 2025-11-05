import axios from "redaxios"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { toast, ToastContent, useToast } from "./use-toast"
import { useSignIn } from "./use-sign-in"

// Track if we've already shown the 401 toast to prevent duplicates
let has401ToastBeenShown = false

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

      if (status === 401 && session) {
        // Clear the stale session from localStorage
        setSession(null)

        // Only show toast once to avoid spam
        if (!has401ToastBeenShown) {
          has401ToastBeenShown = true
          toastLibrary.custom(
            (t) => (
              <div onClick={() => signIn()} className="cursor-pointer">
                <ToastContent
                  title={"Unauthorized"}
                  description={
                    "You may need to sign in again. Click here to sign in again"
                  }
                  variant={"destructive"}
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
          setTimeout(() => {
            has401ToastBeenShown = false
          }, 6000)
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
