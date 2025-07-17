import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "./useAxios"
import { useToast } from "./useToast"

export const useDeletePackage = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const axios = useAxios()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation(
    ["deletePackage"],
    async ({ package_id }: { package_id: string }) => {
      const response = await axios.post("/packages/delete", {
        package_id,
      })

      if (!response.data.ok) {
        throw new Error("Failed to delete package")
      }

      return response.data
    },
    {
      onSuccess: (_, variables) => {
        toast({
          title: "Package deleted",
          description: "Package deleted successfully",
        })
        if (variables?.package_id) {
          queryClient.invalidateQueries(["packages", variables.package_id])
        }
        onSuccess?.()
      },
      onError: (error: any) => {
        toast({
          title: "Error deleting package",
          description: "Failed to delete package",
          variant: "destructive",
        })
      },
    },
  )
}
