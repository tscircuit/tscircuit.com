import { useMemo } from "react"
import axios from "redaxios"
import { useGlobalStore } from "./use-global-store"
import { useSnippetsBaseApiUrl } from "./use-snippets-base-api-url"

export const useAxios = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
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
