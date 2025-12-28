import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"

export const useDeleteAccountMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)
  const queryClient = useQueryClient()

  return useMutation<{ ok: boolean }, any, void>(
    ["deleteAccount"],
    async () => {
      if (!session) throw new Error("No session")

      const { data } = await axios.delete("/accounts/delete")

      return data
    },
    {
      onSuccess: () => {
        setSession(null)
        queryClient.clear()
        onSuccess?.()
      },
      onError: (error: any) => {
        console.error("Error deleting account:", error)
        onError?.(error)
      },
    },
  )
}
