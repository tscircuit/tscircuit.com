import { useState } from "react"
import { useApiBaseUrl } from "./use-packages-base-api-url"

interface UsePackageReleaseImagesProps {
  packageName?: string | null
  fsSha?: string | null
}

interface ViewConfig {
  id: string
  label: string
  backgroundClass: string
  imageUrl?: string
}

type ImageStatus = "loading" | "loaded" | "error"

export function usePackageReleaseImages({
  packageName,
  fsSha,
}: UsePackageReleaseImagesProps) {
  const apiBaseUrl = useApiBaseUrl()

  const [imageStatus, setImageStatus] = useState<Record<string, ImageStatus>>({
    "3d": "loading",
    pcb: "loading",
    schematic: "loading",
  })

  const views: ViewConfig[] = [
    {
      id: "3d",
      label: "3D",
      backgroundClass: "bg-gray-100",
      imageUrl:
        packageName && fsSha
          ? `${apiBaseUrl}/packages/images/${packageName}/3d.png?fs_sha=${fsSha}`
          : undefined,
    },
    {
      id: "pcb",
      label: "PCB",
      backgroundClass: "bg-black",
      imageUrl:
        packageName && fsSha
          ? `${apiBaseUrl}/packages/images/${packageName}/pcb.svg?fs_sha=${fsSha}`
          : undefined,
    },
    {
      id: "schematic",
      label: "Schematic",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl:
        packageName && fsSha
          ? `${apiBaseUrl}/packages/images/${packageName}/schematic.svg?fs_sha=${fsSha}`
          : undefined,
    },
  ]

  const handleImageLoad = (viewId: string) => {
    setImageStatus((prev) => ({ ...prev, [viewId]: "loaded" }))
  }

  const handleImageError = (viewId: string) => {
    setImageStatus((prev) => ({ ...prev, [viewId]: "error" }))
  }

  const availableViews = views
    .map((view) => ({
      ...view,
      status: imageStatus[view.id] as ImageStatus,
      onLoad: () => handleImageLoad(view.id),
      onError: () => handleImageError(view.id),
    }))
    .filter((view) => view.status !== "error" && view.imageUrl)

  return { availableViews }
}
