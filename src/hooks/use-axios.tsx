import axios from "redaxios"
import { useMemo, useRef } from "react"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { toast, ToastContent, useToast } from "./use-toast"
import { useSignIn } from "./use-sign-in"

export const useAxios = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)
  const { toastLibrary } = useToast()
  const signIn = useSignIn()
  const unauthorizedToastShownRef = useRef(false)

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

      if (status === 401) {
        if (!unauthorizedToastShownRef.current) {
          unauthorizedToastShownRef.current = true
          toastLibrary.custom(
            (t) => (
              <div
                onClick={() => {
                  unauthorizedToastShownRef.current = false
                  signIn()
                }}
                className="cursor-pointer"
              >
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

          // Reset the flag after 5 seconds to allow showing toast again if needed
          setTimeout(() => {
            unauthorizedToastShownRef.current = false
          }, 5000)
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
  }, [session?.token, snippetsBaseApiUrl, toastLibrary, signIn])
}
