import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type {
  OrgAccount,
  UserPermissions,
} from "fake-snippets-api/lib/db/schema"

type OrgMember = OrgAccount & { org_member_permissions: UserPermissions | null }

export const useGetOrgMember = ({
  orgId,
  accountId,
}: {
  orgId?: string
  accountId?: string
}) => {
  const axios = useAxios()

  return useQuery<OrgMember | null, Error & { status: number }>(
    ["orgs", "get_member", orgId, accountId],
    async () => {
      if (!orgId || !accountId) {
        return null
      }
      const { data } = await axios.get("/orgs/get_member", {
        params: { org_id: orgId, account_id: accountId },
      })
      return data.org_member
    },
    {
      enabled: Boolean(orgId && accountId),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  )
}
