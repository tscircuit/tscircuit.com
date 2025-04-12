import { useMutation } from "react-query"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

export const useDeletePackage = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const axios = useAxios()
  const { toast } = useToast()

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
      onSuccess: () => {
        toast({
          title: "Package deleted",
          description: "Package deleted successfully",
        })
        onSuccess?.()
      },
      onError: (error: any) => {
        toast({
          title: "Error deleting package",
          description: "Failed to delete package",
        })
      },
    },
  )
}
