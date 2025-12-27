import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export interface UpdateOrgParams {
  orgId: string
  tscircuit_handle?: string
  display_name?: string
}

export const useUpdateOrgMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (org: PublicOrgSchema) => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const queryClient = useQueryClient()

  return useMutation<PublicOrgSchema, unknown, UpdateOrgParams>(
    ["updateOrg"],
    async ({ orgId, tscircuit_handle, display_name }) => {
      if (!session) throw new Error("No session")

      const {
        data: { org: updatedOrg },
      } = await axios.post("/orgs/update", {
        org_id: orgId,
        tscircuit_handle,
        display_name,
      })

      if (!updatedOrg) {
        throw new Error("Failed to update organization")
      }

      return updatedOrg
    },
    {
      onSuccess: (org: PublicOrgSchema) => {
        queryClient.invalidateQueries(["orgs"])
        onSuccess?.(org)
      },
      onError: (error: unknown) => {
        console.error("Error updating organization:", error)
        onError?.(error)
      },
    },
  )
}
