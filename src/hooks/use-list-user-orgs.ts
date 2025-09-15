import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useListUserOrgs = () => {
  const axios = useAxios()
  return useQuery<PublicOrgSchema[], Error & { status: number }>(
    ["orgs", "list"],
    async () => {
      const { data } = await axios.get("/orgs/list")
      return data.orgs
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
