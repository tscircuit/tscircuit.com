import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useOrganization = ({
  orgId,
  orgTscircuitHandle,
  github_handle,
}: { orgId?: string; orgTscircuitHandle?: string; github_handle?: string }) => {
  const axios = useAxios()

  const orgQuery = useQuery<PublicOrgSchema, Error & { status: number }>(
    ["orgs", "get", orgId || orgTscircuitHandle || github_handle],
    async () => {
      if (!orgId && !orgTscircuitHandle && !github_handle) {
        throw new Error("Organization ID, name, or GitHub handle is required")
      }
      const params = orgId
        ? { org_id: orgId }
        : orgTscircuitHandle
          ? { tscircuit_handle: orgTscircuitHandle }
          : { github_handle }
      const { data } = await axios.get("/orgs/get", { params })
      return data.org
    },
    {
      enabled: Boolean(orgId || orgTscircuitHandle || github_handle),
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
    isFetched: orgQuery.isFetched,
  }
}
