import { useQuery } from "react-query"
import { usePublicAxios } from "@/hooks/use-public-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrg = ({ orgName }: { orgName: string | null }) => {
  const axios = usePublicAxios()
  return useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", orgName],
    async () => {
      if (!orgName) {
        throw new Error("Organization name is required")
      }
      const { data } = await axios.get("/orgs/get", {
        params: { org_name: orgName },
      })
      return data.org
    },
    {
      enabled: Boolean(orgName),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
