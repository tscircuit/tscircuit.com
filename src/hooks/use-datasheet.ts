import { useQuery } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"

export const useDatasheet = (chipName: string | null) => {
  const axios = useAxios()
  return useQuery<Datasheet, Error & { status: number }>(
    ["datasheet", chipName],
    async () => {
      if (!chipName) throw new Error("chip name required")
      const { data } = await axios.get("/datasheets/get", {
        params: { chip_name: chipName },
      })
      return data.datasheet as Datasheet
    },
    { enabled: Boolean(chipName), retry: false, refetchOnWindowFocus: false },
  )
}
