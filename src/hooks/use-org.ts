import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrg = ({ orgName }: { orgName: string | null }) => {
  const axios = useAxios()
  return useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", orgName],
    async () => {
      if (!orgName) {
        throw new Error("Organization name is required")
      }
      const { data } = await axios.post("/orgs/get", {
        org_name: orgName,
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
