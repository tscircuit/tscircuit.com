import axios from "redaxios"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { ToastContent, useToast } from "./use-toast"
import { useSignIn } from "./use-sign-in"

export const useAxios = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)
  const openHandleRequiredDialog = useGlobalStore(
    (s) => s.openTscircuitHandleRequiredDialog,
  )
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

    const originalGet = instance.get.bind(instance)
    const originalPost = instance.post.bind(instance)
    const originalPut = instance.put.bind(instance)
    const originalDelete = instance.delete.bind(instance)
    const originalPatch = instance.patch.bind(instance)

    const handleError = (error: any) => {
      const status = error?.response?.status ?? error?.status
      const errorCode =
        error?.data?.error_code || error?.data?.error?.error_code
      if (status === 401) {
        toastLibrary.custom(
          (t) => (
            <div onClick={() => signIn()} className="cursor-pointer">
              <ToastContent
                title={
                  errorCode == "session_not_found" ||
                  errorCode == "session_expired"
                    ? "Session Expired"
                    : "Unauthorized"
                }
                description={
                  errorCode == "session_not_found" ||
                  errorCode == "session_expired"
                    ? "Your session has expired. Click here to sign in again"
                    : "You may need to sign in. Click here to sign in again"
                }
                variant={"destructive"}
                t={t}
              />
            </div>
          ),
          { id: "auth-401" },
        )
      } else if (errorCode === "tscircuit_handle_required") {
        openHandleRequiredDialog(
          "Please set a tscircuit handle before using this feature.",
        )
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
