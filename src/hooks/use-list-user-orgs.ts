import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore, getSessionHandle } from "./use-global-store"

export const useListUserOrgs = (githubHandle?: string) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const fallbackHandle = getSessionHandle(session)
  const githubParam = githubHandle ?? fallbackHandle ?? null
  const tscircuitParam = fallbackHandle ?? githubHandle ?? null
  const hasFilterHandle = Boolean(githubParam || tscircuitParam)

  return useQuery<PublicOrgSchema[], Error & { status: number }>(
    ["orgs", "list", githubParam, tscircuitParam],
    async () => {
      const params: Record<string, string> = {}
      if (githubParam) params.github_handle = githubParam
      if (tscircuitParam) params.tscircuit_handle = tscircuitParam

      const { data } = await axios.get("/orgs/list", {
        ...(hasFilterHandle ? { params } : {}),
      })
      return data.orgs
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: hasFilterHandle,
    },
  )
}
