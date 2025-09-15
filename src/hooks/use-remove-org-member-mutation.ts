import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useRemoveOrgMemberMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["removeOrgMember"],
    async ({ orgId, accountId }: { orgId: string; accountId: string }) => {
      if (!session) throw new Error("No session")

      await axios.post("/orgs/remove_member", {
        org_id: orgId,
        account_id: accountId,
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orgs", "members"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error removing organization member:", error)
      },
    },
  )
}
