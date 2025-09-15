import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useAddOrgMemberMutation = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["addOrgMember"],
    async ({ orgId, accountId }: { orgId: string; accountId: string }) => {
      if (!session) throw new Error("No session")

      await axios.post("/orgs/add_member", {
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
        console.error("Error adding organization member:", error)
      },
    },
  )
}
