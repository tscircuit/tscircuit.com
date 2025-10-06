import axios from "redaxios"
import { useMemo } from "react"
import { useApiBaseUrl } from "./use-packages-base-api-url"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"

const trimTrailingSlash = (url: string) => url.replace(/\/$/, "")

export const usePublicAxios = () => {
  const apiBaseUrl = useApiBaseUrl()
  const isUsingFakeApi = useIsUsingFakeApi()

  return useMemo(() => {
    const normalizedBaseUrl = trimTrailingSlash(apiBaseUrl)
    const baseURL = isUsingFakeApi
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/public`

    return axios.create({ baseURL })
  }, [apiBaseUrl, isUsingFakeApi])
}
