import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

export const useUpdateAiDescriptionMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation(
    async ({ package_id }: { package_id: string }) => {
      const { data } = await axios.post("/packages/update_ai_description", {
        package_id,
      })
      return data
    },
    {
      onSuccess: () => {
        toast({
          title: "AI description update requested",
          description: "The AI description will be regenerated shortly.",
        })
        queryClient.invalidateQueries(["package"])
        onSuccess?.()
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error?.response?.data?.message ||
            error?.data?.message ||
            "Failed to request AI description update.",
          variant: "destructive",
        })
      },
    },
  )
}
