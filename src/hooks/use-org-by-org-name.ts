import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrgByName = (name: string | null) => {
  const axios = useAxios()
  return useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", "by-org-name", name],
    async () => {
      if (!name) {
        throw new Error("Organisation name is required")
      }
      const { data } = await axios.get("/orgs/get", {
        params: { org_name: name },
      })
      return data.org
    },
    {
      enabled: Boolean(name),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
