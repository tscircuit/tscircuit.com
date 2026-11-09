import { useInfiniteQuery } from "react-query"
import { publishedReferenceDesignSchema } from "@tscircuit/runframe/reference-designs"
import { z } from "zod"
import { useAxios } from "./use-axios"

const responseSchema = z.object({
  reference_designs: z.array(publishedReferenceDesignSchema),
  pagination: z.object({ next_cursor: z.string().nullable() }),
})

export function useDatasheetReferenceDesigns(chipName: string) {
  const axios = useAxios()
  const package_release_id =
    new URLSearchParams(window.location.search).get(
      "reference_design_release_id",
    ) ?? undefined
  return useInfiniteQuery(
    ["datasheetReferenceDesigns", chipName, package_release_id],
    async ({ pageParam }) => {
      const response = await axios.get("/datasheet_reference_designs/list", {
        params: {
          chip_name: chipName,
          ...(package_release_id ? { package_release_id } : {}),
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      })
      return responseSchema.parse(response.data)
    },
    {
      enabled: Boolean(chipName),
      getNextPageParam: (page) => page.pagination.next_cursor ?? undefined,
      staleTime: 60_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
