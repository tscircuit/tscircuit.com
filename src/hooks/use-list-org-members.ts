import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Account } from "fake-snippets-api/lib/db/schema"

export const useListOrgMembers = ({
  orgId,
  orgName,
}: { orgId?: string; orgName?: string }) => {
  const axios = useAxios()
  return useQuery<Account[], Error & { status: number }>(
    ["orgs", "members", orgId || orgName],
    async () => {
      if (!orgId && !orgName) {
        throw new Error("Organization ID or name is required")
      }
      const params = orgId ? { org_id: orgId } : { name: orgName }
      try {
        const { data } = await axios.get("/orgs/list_members", { params })
        return data.members
      } catch (error: any) {
        // If authentication fails (403), return empty array for public orgs
        // This allows viewing public org pages without member details
        if (error?.status === 403 || error?.response?.status === 403) {
          return []
        }
        throw error
      }
    },
    {
      enabled: Boolean(orgId || orgName),
      retry: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  )
}
