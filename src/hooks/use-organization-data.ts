import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useListOrgMembers } from "@/hooks/use-list-org-members"

interface Package {
  package_id: string
  name: string
  owner_github_username: string
  starred_at: string | null
  user_permissions?: {
    can_manage_packages: boolean
  }
}

export const useOrganizationPackages = ({ orgName }: { orgName?: string }) => {
  const axios = useAxios()
  return useQuery<Package[], Error & { status: number }>(
    ["orgs", "packages", orgName],
    async () => {
      if (!orgName) {
        throw new Error("Organization name is required")
      }
      const { data } = await axios.get("/packages/list", {
        params: { owner_github_username: orgName },
      })
      return data.packages
    },
    {
      enabled: Boolean(orgName),
      retry: false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  )
}

export const useOrganization = ({
  orgId,
  orgName,
}: { orgId?: string; orgName?: string }) => {
  const membersQuery = useListOrgMembers({ orgId, orgName })
  const packagesQuery = useOrganizationPackages({ orgName })

  return {
    members: membersQuery.data || [],
    packages: packagesQuery.data || [],
    membersCount: membersQuery.data?.length || 0,
    packagesCount: packagesQuery.data?.length || 0,
    isLoading: membersQuery.isLoading || packagesQuery.isLoading,
    isError: membersQuery.isError || packagesQuery.isError,
    error: membersQuery.error || packagesQuery.error,
  }
}
