import { useQuery } from "react-query"
import { useAxios } from "./use-axios"
import type { Datasheet } from "fake-snippets-api/lib/db/schema"

export const useDatasheet = (chipName: string | null) => {
  const axios = useAxios()
  return useQuery<Datasheet, Error & { status: number }>(
    ["datasheet", chipName],
    async () => {
      if (!chipName) throw new Error("chip name required")
      const { data } = await axios.get("/datasheets/get", {
        params: { datasheet_id: chipName },
      })
      return data.datasheet
    },
    {
      enabled: Boolean(chipName),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
