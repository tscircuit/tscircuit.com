import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrganization = ({
  orgId,
  orgName,
}: { orgId?: string; orgName?: string }) => {
  const axios = useAxios()

  const orgQuery = useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", "get", orgId || orgName],
    async () => {
      if (!orgId && !orgName) {
        throw new Error("Organization ID or name is required")
      }
      const params = orgId ? { org_id: orgId } : { org_name: orgName }
      const { data } = await axios.get("/orgs/get", { params })
      return data.org
    },
    {
      enabled: Boolean(orgId || orgName),
      retry: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  )

  return {
    organization: orgQuery.data,
    membersCount: orgQuery.data?.member_count || 0,
    packagesCount: orgQuery.data?.package_count || 0,
    isLoading: orgQuery.isLoading,
    isError: orgQuery.isError,
    error: orgQuery.error,
  }
}
