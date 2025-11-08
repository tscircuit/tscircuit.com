import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "./use-global-store"

export const useListUserOrgs = ({
  tscircuit_handle,
  github_handle,
}: {
  tscircuit_handle?: string
  github_handle?: string
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const tscircuitHandle = tscircuit_handle || session?.tscircuit_handle
  return useQuery<PublicOrgSchema[], Error & { status: number }>(
    ["orgs", "list", github_handle || tscircuit_handle],
    async () => {
      const { data } = await axios.get("/orgs/list", {
        ...(github_handle && { params: { github_handle } }),
        ...(tscircuitHandle && {
          params: { tscircuit_handle: tscircuitHandle },
        }),
      })
      return data.orgs
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(github_handle || tscircuitHandle),
    },
  )
}
