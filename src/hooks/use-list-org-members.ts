import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Account } from "fake-snippets-api/lib/db/schema"

interface MemberAccount extends Account {
  joined_at?: string
}

export const useListOrgMembers = ({
  orgId,
  orgName,
}: { orgId?: string; orgName?: string }) => {
  const axios = useAxios()
  return useQuery<MemberAccount[], Error & { status: number }>(
    ["orgs", "members", orgId || orgName],
    async () => {
      if (!orgId && !orgName) {
        throw new Error("Organization ID or name is required")
      }
      const params = orgId ? { org_id: orgId } : { name: orgName }
      const { data } = await axios.get("/orgs/list_members", { params })
      return data.members
    },
    {
      enabled: Boolean(orgId || orgName),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    },
  )
}
