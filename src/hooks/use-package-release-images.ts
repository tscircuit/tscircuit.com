import { useState } from "react"
import { useApiBaseUrl } from "./use-packages-base-api-url"

interface UsePackageReleaseImagesProps {
  packageReleaseId?: string | null
}

export function usePackageReleaseImages({
  packageReleaseId,
}: UsePackageReleaseImagesProps) {
  const baseUrl = useApiBaseUrl()
  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({
    schematic: "loading",
    pcb: "loading",
    "3d": "loading",
  })

  const views = [
    { id: "schematic", label: "Schematic", filePath: "dist/schematic.svg" },
    { id: "pcb", label: "PCB", filePath: "dist/pcb.svg" },
    { id: "3d", label: "3D", filePath: "dist/3d.svg" },
  ]

  const handleLoad = (viewId: string) => {
    setImageStatus((prev) => ({ ...prev, [viewId]: "loaded" }))
  }

  const handleError = (viewId: string) => {
    setImageStatus((prev) => ({ ...prev, [viewId]: "error" }))
  }

  const availableViews = views
    .map((view) => {
      const imageUrl = packageReleaseId
        ? `${baseUrl}/package_files/download?package_release_id=${packageReleaseId}&file_path=${encodeURIComponent(view.filePath)}`
        : undefined
      return {
        ...view,
        imageUrl,
        status: imageStatus[view.id],
        onLoad: () => handleLoad(view.id),
        onError: () => handleError(view.id),
      }
    })
    .filter((view) => view.imageUrl && view.status !== "error")

  return { availableViews }
}
