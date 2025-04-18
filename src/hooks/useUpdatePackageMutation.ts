import { useMutation, useQueryClient } from "react-query"
import { useToast } from "@/hooks/use-toast"
import { useAxios } from "@/hooks/use-axios"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface UseUpdatePackageMutationProps {
  pkg: Package | undefined
  code: string
  dts: string
  circuitJson: any
  manualEditsFileContent: string
}

export function useUpdatePackageMutation({
  pkg,
  code,
  dts,
  circuitJson,
  manualEditsFileContent,
}: UseUpdatePackageMutationProps) {
  const axios = useAxios()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      if (!pkg) throw new Error("No package to update")

      const updatePkgPayload = {
        package_id: pkg.package_id,
        code,
        dts,
        circuit_json: circuitJson,
        manual_edits_json_content: manualEditsFileContent,
      }

      try {
        const response = await axios.post("/packages/update", updatePkgPayload)
        return response.data
      } catch (error: any) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["package", pkg?.package_id] })
      toast({
        title: "Package saved",
        description: "Your changes have been saved successfully.",
      })
    },
    onError: (error) => {
      console.error("Error saving pkg:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save the package. Please try again.",
        variant: "destructive",
      })
    },
  })
}
