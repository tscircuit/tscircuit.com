import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { useGlobalStore } from "./use-global-store"

export const useListUserOrgs = () => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)

  return useQuery<PublicOrgSchema[], Error & { status: number }>(
    ["orgs", "list", session?.account_id],
    async () => {
      const { data } = await axios.get("/orgs/list", {
        ...(session?.account_id && {
          params: { account_id: session.account_id },
        }),
      })
      return data.orgs
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: Boolean(session?.account_id),
    },
  )
}
