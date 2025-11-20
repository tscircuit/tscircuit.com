import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

interface AcceptOrgInvitationResponse {
  org_account_id: string
  org: {
    org_id: string
    org_name: string
    org_display_name: string
  }
}

export const useAcceptOrgInvitationMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: AcceptOrgInvitationResponse) => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["acceptOrgInvitation"],
    async ({ invitationToken }: { invitationToken: string }) => {
      if (!session) throw new Error("No session")

      const { data } = await axios.post("/orgs/invitations/accept", {
        invitation_token: invitationToken,
      })
      return data
    },
    {
      onSuccess: (data) => {
        // Invalidate org members list, user's orgs list, and org details
        queryClient.invalidateQueries(["orgs", "members"])
        queryClient.invalidateQueries(["orgs", "list"])
        queryClient.invalidateQueries(["orgs", "get"])
        onSuccess?.(data)
      },
      onError: (error: any) => {
        console.error("Error accepting organization invitation:", error)
        onError?.(error)
      },
    },
  )
}
