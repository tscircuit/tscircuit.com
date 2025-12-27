import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"

interface OrgInvitationListItem {
  org_invitation_id: string
  invitee_email: string | null
  is_pending: boolean
  is_accepted: boolean
  is_expired: boolean
  is_revoked: boolean
  created_at: string
  expires_at: string
  accepted_at: string | null
  inviter: {
    account_id: string
    github_username: string | null
    tscircuit_handle: string | null
  }
}

export const useListOrgInvitations = ({ orgId }: { orgId?: string }) => {
  const axios = useAxios()
  return useQuery<OrgInvitationListItem[], Error & { status: number }>(
    ["orgs", "invitations", "list", orgId],
    async () => {
      if (!orgId) {
        throw new Error("Organization ID is required")
      }
      const { data } = await axios.get("/orgs/invitations/list", {
        params: { org_id: orgId },
      })
      return data.invitations
    },
    {
      enabled: Boolean(orgId),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData: true,
    },
  )
}
