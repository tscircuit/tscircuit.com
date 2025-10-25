import axios from "redaxios"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { toast } from "./use-toast"

export const useAxios = () => {
  const snippetsBaseApiUrl = useApiBaseUrl()
  const session = useGlobalStore((s) => s.session)
  return useMemo(() => {
    const instance = axios.create({
      baseURL: snippetsBaseApiUrl,
      headers: session
        ? {
            Authorization: `Bearer ${session?.token}`,
          }
        : {},
    })

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status ?? error?.status

        if (status === 401) {
          toast({
            title: "Session expired",
            description: "Please sign in again.",
            variant: "destructive",
          })
        }

        throw error
      },
    )

    return instance
  }, [session?.token, snippetsBaseApiUrl])
}
