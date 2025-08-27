import { useQueries } from "react-query"
import { useAxios } from "./use-axios"

interface UsePackageReleaseImagesProps {
  packageReleaseId?: string | null
}

interface ViewConfig {
  id: string
  label: string
  filePath: string
}

export function usePackageReleaseImages({
  packageReleaseId,
}: UsePackageReleaseImagesProps) {
  const axios = useAxios()

  const views: ViewConfig[] = [
    { id: "schematic", label: "Schematic", filePath: "dist/schematic.svg" },
    { id: "pcb", label: "PCB", filePath: "dist/pcb.svg" },
    { id: "3d", label: "3D", filePath: "dist/3d.svg" },
  ]

  const queries = useQueries(
    views.map((view) => ({
      queryKey: ["packageReleaseImage", packageReleaseId, view.filePath],
      queryFn: async () => {
        if (!packageReleaseId) return null

        try {
          const { data } = await axios.get("/package_files/get", {
            params: {
              package_release_id: packageReleaseId,
              file_path: view.filePath,
            },
          })
          return data.package_file?.content_text ?? null
        } catch (error: any) {
          const status = error?.status ?? error?.response?.status
          if (status === 404) {
            return null
          }
          throw error
        }
      },
      enabled: Boolean(packageReleaseId),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    })),
  )

  const availableViews = views
    .map((view, idx) => ({
      id: view.id,
      label: view.label,
      svg: queries[idx].data as string | null,
      isLoading: queries[idx].isLoading,
    }))
    .filter((v) => v.isLoading || v.svg)

  return { availableViews }
}
