import { useInfiniteQuery } from "react-query"
import { publishedReferenceDesignSchema } from "@tscircuit/runframe/reference-designs"
import { z } from "zod"
import { useAxios } from "./use-axios"
import { getReferenceDesignPreviewUrl } from "@/lib/get-reference-design-preview-url"

const responseSchema = z.object({
  reference_designs: z.array(publishedReferenceDesignSchema),
  pagination: z.object({ next_cursor: z.string().nullable() }),
})

export function useDatasheetReferenceDesigns(chipName: string) {
  const axios = useAxios()
  const previewUrl = getReferenceDesignPreviewUrl(chipName)
  const package_release_id =
    new URLSearchParams(window.location.search).get(
      "reference_design_release_id",
    ) ?? undefined
  const query = useInfiniteQuery(
    ["datasheetReferenceDesigns", chipName, package_release_id, previewUrl],
    async ({ pageParam }) => {
      if (previewUrl) {
        const response = await fetch(`${previewUrl}/list.json`)
        if (!response.ok) throw new Error("Unable to load reference designs")
        return responseSchema.parse(await response.json())
      }
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
  return { ...query, artifactBaseUrl: previewUrl }
}
