import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useDeleteOrgMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, any, { orgId: string }>(
    ["deleteOrg"],
    async ({ orgId }) => {
      if (!session) throw new Error("No session")

      const { data } = await axios.post("/orgs/delete", {
        org_id: orgId,
      })

      return data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["orgs"])
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error deleting organization:", error)
        onError?.(error)
      },
    },
  )
}
