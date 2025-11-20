import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useRevokeOrgInvitationMutation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: (error: any) => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["revokeOrgInvitation"],
    async ({ invitationId }: { invitationId: string }) => {
      if (!session) throw new Error("No session")

      await axios.delete("/orgs/invitations/revoke", {
        data: { org_invitation_id: invitationId },
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orgs", "invitations", "list"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error revoking organization invitation:", error)
        onError?.(error)
      },
    },
  )
}
