import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface RefreshAiDescriptionParams {
  package_id: string
}

interface RefreshAiDescriptionResponse {
  ok: boolean
  package: Package
}

export const useRefreshAiDescriptionMutation = (options?: {
  onSuccess?: (data: RefreshAiDescriptionResponse) => void
  onError?: (error: Error) => void
}) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation<
    RefreshAiDescriptionResponse,
    Error,
    RefreshAiDescriptionParams
  >({
    mutationFn: async ({ package_id }) => {
      const { data } = await axios.post("/packages/refresh_ai_description", {
        package_id,
      })
      return data
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries(["package", data.package.package_id])
      queryClient.invalidateQueries(["package", data.package.name])
      options?.onSuccess?.(data)
    },
    onError: options?.onError,
  })
}
