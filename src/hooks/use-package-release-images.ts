import { useMemo, useCallback } from "react"
import { useQueries } from "react-query"
import { useAxios } from "./use-axios"
import { useParams } from "wouter"
import { useApiBaseUrl } from "./use-packages-base-api-url"

interface UsePackageReleaseImagesProps {
  packageReleaseId?: string | null
  availableFilePaths?: string[] | undefined
}

interface ViewConfig {
  id: string
  label: string
  backgroundClass: string
}

const VIEWS: ViewConfig[] = [
  {
    id: "3d",
    label: "3D",
    backgroundClass: "bg-gray-100",
  },
  {
    id: "pcb",
    label: "PCB",
    backgroundClass: "bg-black",
  },
  {
    id: "schematic",
    label: "Schematic",
    backgroundClass: "bg-[#F5F1ED]",
  },
]

export function usePackageReleaseImages({
  packageReleaseId,
}: UsePackageReleaseImagesProps) {
  const apiurl = useApiBaseUrl()
  const axios = useAxios()
  const { author, packageName } = useParams()

  const createQueryFn = useCallback(
    (viewId: string) => async () => {
      if (!packageReleaseId || !author || !packageName) return null

      const imageUrl = `${apiurl}/packages/images/${author}/${packageName}/${viewId}.png?package_release_id=${packageReleaseId}`

      try {
        const response = await axios.head(imageUrl)
        return response.status === 200 ? imageUrl : null
      } catch {
        return null
      }
    },
    [packageReleaseId, author, packageName, apiurl, axios],
  )

  const queryConfigs = useMemo(
    () =>
      VIEWS.map((view) => ({
        queryKey: [
          "packageReleaseImage",
          packageReleaseId,
          view.id,
          author,
          packageName,
        ],
        queryFn: createQueryFn(view.id),
        enabled: Boolean(packageReleaseId && author && packageName),
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: Infinity,
        cacheTime: Infinity,
      })),
    [packageReleaseId, author, packageName, createQueryFn],
  )

  const queries = useQueries(queryConfigs)

  const availableViews = useMemo(() => {
    const result = []

    for (let i = 0; i < VIEWS.length; i++) {
      const view = VIEWS[i]
      const query = queries[i]

      if (query.isLoading || query.data) {
        result.push({
          id: view.id,
          label: view.label,
          imageUrl: query.data || "",
          isLoading: query.isLoading,
          backgroundClass: view.backgroundClass,
        })
      }
    }

    return result
  }, [queries])

  return { availableViews }
}
