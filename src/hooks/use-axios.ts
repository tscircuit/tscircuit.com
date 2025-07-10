import axios from "redaxios"
import { useMemo } from "react"
import { useGlobalStore } from "./use-global-store"
import { usePackagesBaseApiUrl } from "./use-packages-base-api-url"

export const useAxios = () => {
  const snippetsBaseApiUrl = usePackagesBaseApiUrl()
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
    return instance
  }, [session?.token])
}
