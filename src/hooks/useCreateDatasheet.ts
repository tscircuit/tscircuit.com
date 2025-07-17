import { useAxios } from "@/hooks/useAxios"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"
import { useMutation, useQueryClient } from "react-query"

export const useCreateDatasheet = ({
  onSuccess,
}: { onSuccess?: (datasheet: Datasheet) => void } = {}) => {
  const axios = useAxios()
  const queryClient = useQueryClient()

  return useMutation(
    ["createDatasheet"],
    async ({ chip_name }: { chip_name: string }) => {
      const { data } = await axios.post("/datasheets/create", { chip_name })
      await axios.get("/_fake/run_async_tasks")
      return data.datasheet as Datasheet
    },
    {
      onSuccess: (datasheet, variables) => {
        if (variables?.chip_name) {
          queryClient.invalidateQueries(["datasheet", variables.chip_name])
        }
        onSuccess?.(datasheet)
      },
      onError: (error: any) => {
        console.error("Error creating datasheet:", error)
      },
    },
  )
}
