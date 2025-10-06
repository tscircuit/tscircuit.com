import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "./use-global-store"

export const useListUserOrgs = (githubHandle?: string) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const github_handle = githubHandle || session?.github_username

  return useQuery<PublicOrgSchema[], Error & { status: number }>(
    ["orgs", "list", github_handle],
    async () => {
      const { data } = await axios.post("/orgs/list", {
        ...(github_handle ? { github_handle } : {}),
      })
      return data.orgs
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(github_handle),
    },
  )
}
