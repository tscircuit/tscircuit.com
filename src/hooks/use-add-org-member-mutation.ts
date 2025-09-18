import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useAddOrgMemberMutation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: (error: any) => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation(
    ["addOrgMember"],
    async ({
      orgId,
      accountId,
      githubUsername,
    }: {
      orgId: string
      accountId?: string
      githubUsername?: string
    }) => {
      if (!session) throw new Error("No session")

      const payload: any = {
        org_id: orgId,
      }

      if (accountId) {
        payload.account_id = accountId
      }

      if (githubUsername) {
        payload.github_username = githubUsername
      }

      await axios.post("/orgs/add_member", payload)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orgs", "members"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error adding organization member:", error)
        onError?.(error)
      },
    },
  )
}
