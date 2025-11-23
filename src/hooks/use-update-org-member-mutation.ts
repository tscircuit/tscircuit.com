import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { UserPermissions } from "fake-snippets-api/lib/db/schema"

export const useUpdateOrgMemberMutation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: (error: any) => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["updateOrgMember"],
    async ({
      orgId,
      accountId,
      permissions,
    }: {
      orgId: string
      accountId: string
      permissions: UserPermissions
    }) => {
      if (!session) throw new Error("No session")

      await axios.post("/orgs/update_member", {
        org_id: orgId,
        account_id: accountId,
        org_member_permissions: permissions,
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orgs", "members"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error updating organization member:", error)
        onError?.(error)
      },
    },
  )
}
