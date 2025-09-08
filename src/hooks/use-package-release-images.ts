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
  backgroundClass: string
}

export function usePackageReleaseImages({
  packageReleaseId,
  availableFilePaths,
}: UsePackageReleaseImagesProps) {
  const axios = useAxios()

  const views: ViewConfig[] = [
    {
      id: "3d",
      label: "3D",
      filePath: "dist/3d.png",
      backgroundClass: "bg-gray-100",
    },
    {
      id: "pcb",
      label: "PCB",
      filePath: "dist/pcb.svg",
      backgroundClass: "bg-black",
    },
    {
      id: "schematic",
      label: "Schematic",
      filePath: "dist/schematic.svg",
      backgroundClass: "bg-[#F5F1ED]",
    },
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
        const content = data.package_file?.content_text
        if (!content) return null
        if (view.filePath.endsWith(".png")) {
          return `data:image/png;base64,${content}`
        }
        return content
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
          image: queries[idx].data as string | null,
          isLoading: queries[idx].isLoading,
          backgroundClass: view.backgroundClass,
        }))
        .filter((v) => v.isLoading || v.image),
    [queries],
  )

  return { availableViews }
}
