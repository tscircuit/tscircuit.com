import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useGlobalStore } from "./use-global-store"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

export const useCreateOrgMutation = ({
  onSuccess,
}: { onSuccess?: (org: PublicOrgSchema) => void } = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)

  return useMutation(
    ["createOrg"],
    async ({ name, display_name }: { name: string; display_name?: string }) => {
      if (!session) throw new Error("No session")

      const {
        data: { org: newOrg },
      } = await axios.post("/orgs/create", {
        name,
        display_name,
      })

      if (!newOrg) {
        throw new Error("Failed to create organization")
      }

      return newOrg
    },
    {
      onSuccess: (org: PublicOrgSchema) => {
        onSuccess?.(org)
      },
      onError: (error: any) => {
        console.error("Error creating organization:", error)
      },
    },
  )
}
