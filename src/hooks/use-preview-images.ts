import { getPackagePreviewImageUrl } from "@/lib/utils/getPackagePreviewImageUrl"
import { Package } from "fake-snippets-api/lib/db/schema"
import { useState } from "react"

interface UsePreviewImagesProps {
  pkg?: Package
}

export function usePreviewImages({ pkg }: UsePreviewImagesProps) {
  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({
    "3d": "loading",
    pcb: "loading",
    schematic: "loading",
  })

  const views = [
    {
      id: "3d",
      label: "3D View",
      backgroundClass: "bg-gray-100",
      imageUrl: pkg ? getPackagePreviewImageUrl(pkg, "3d") : undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      backgroundClass: "bg-black",
      imageUrl: pkg ? getPackagePreviewImageUrl(pkg, "pcb") : undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl: pkg ? getPackagePreviewImageUrl(pkg, "schematic") : undefined,
    },
  ]

  const handleImageLoad = (viewId: string) => {
    setImageStatus((prev) => ({
      ...prev,
      [viewId]: "loaded",
    }))
  }

  const handleImageError = (viewId: string) => {
    setImageStatus((prev) => ({
      ...prev,
      [viewId]: "error",
    }))
  }

  const availableViews = views
    .map((view) => ({
      ...view,
      status: imageStatus[view.id],
      onLoad: () => handleImageLoad(view.id),
      onError: () => handleImageError(view.id),
    }))
    .filter((view) => view.status !== "error")

  return {
    availableViews,
  }
}
