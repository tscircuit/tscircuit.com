import { useMemo } from "react"
import { useQueries } from "react-query"
import { useAxios } from "./use-axios"

interface UsePackageReleaseImagesProps {
  packageReleaseId?: string | null
  availableFilePaths?: string[] | undefined
}

interface ViewConfig {
  id: string
  label: string
  filePath: string
}

export function usePackageReleaseImages({
  packageReleaseId,
  availableFilePaths,
}: UsePackageReleaseImagesProps) {
  const axios = useAxios()

  const views: ViewConfig[] = [
    { id: "3d", label: "3D", filePath: "dist/3d.svg" },
    { id: "pcb", label: "PCB", filePath: "dist/pcb.svg" },
    { id: "schematic", label: "Schematic", filePath: "dist/schematic.svg" },
  ]

  const queries = useQueries(
    views.map((view) => ({
      queryKey: ["packageReleaseImage", packageReleaseId, view.filePath],
      queryFn: async () => {
        if (!packageReleaseId) return null

        const { data } = await axios.get("/package_files/get", {
          params: {
            package_release_id: packageReleaseId,
            file_path: view.filePath,
          },
        })
        return data.package_file?.content_text ?? null
      },
      enabled:
        Boolean(packageReleaseId) &&
        Boolean(
          !availableFilePaths || availableFilePaths?.includes(view.filePath),
        ),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      cacheTime: Infinity,
    })),
  )

  const availableViews = useMemo(
    () =>
      views
        .map((view, idx) => ({
          id: view.id,
          label: view.label,
          svg: queries[idx].data as string | null,
          isLoading: queries[idx].isLoading,
        }))
        .filter((v) => v.isLoading || v.svg),
    [queries],
  )

  return { availableViews }
}
