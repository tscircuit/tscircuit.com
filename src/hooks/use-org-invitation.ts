import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"

interface OrgInvitation {
  org_invitation_id: string
  invitee_email: string | null
  is_pending: boolean
  is_accepted: boolean
  is_revoked: boolean
  is_expired: boolean
  created_at: string
  expires_at: string
  org: {
    org_id: string
    org_name: string
    org_display_name: string
  }
  inviter: {
    github_username: string | null
    tscircuit_handle: string | null
  }
}

export const useOrgInvitation = ({ token }: { token?: string }) => {
  const axios = useAxios()
  return useQuery<{ invitation: OrgInvitation }, Error & { status: number }>(
    ["orgs", "invitations", "detail", token],
    async () => {
      if (!token) {
        throw new Error("Invitation token is required")
      }
      const { data } = await axios.get("/orgs/invitations/get", {
        params: { token },
      })
      return data
    },
    {
      enabled: Boolean(token),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  )
}
