import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { PublicOrgSchema } from "fake-snippets-api/lib/db/schema"

interface UploadOrgAvatarParams {
  orgId: string
  avatarFile: File
}

export const useUploadOrgAvatarMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (org: PublicOrgSchema) => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation<PublicOrgSchema, unknown, UploadOrgAvatarParams>(
    ["uploadOrgAvatar"],
    async ({ orgId, avatarFile }) => {
      const formData = new FormData()
      formData.append("org_id", orgId)
      formData.append("avatar", avatarFile)

      const {
        data: { org },
      } = await axios.post("/orgs/upload_avatar", formData)

      return org
    },
    {
      onSuccess: (org) => {
        queryClient.invalidateQueries(["orgs"])
        onSuccess?.(org)
      },
      onError: (error) => {
        onError?.(error)
      },
    },
  )
}
