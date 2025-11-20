import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

interface CreateOrgInvitationResponse {
  org_invitation_id: string
  invitation_token: string
  invitee_email: string
  expires_at: string
}

export const useCreateOrgInvitationMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CreateOrgInvitationResponse) => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["createOrgInvitation"],
    async ({
      orgId,
      inviteeEmail,
    }: {
      orgId: string
      inviteeEmail: string
    }) => {
      if (!session) throw new Error("No session")

      const { data } = await axios.post("/orgs/invitations/create", {
        org_id: orgId,
        invitee_email: inviteeEmail,
      })
      return data
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["orgs", "invitations", "list"])
        onSuccess?.(data)
      },
      onError: (error: any) => {
        console.error("Error creating organization invitation:", error)
        onError?.(error)
      },
    },
  )
}
