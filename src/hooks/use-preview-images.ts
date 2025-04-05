import { useState, useMemo } from "react"

interface UsePreviewImagesProps {
  packageName?: string
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
}

export function usePreviewImages({
  packageName,
  onViewChange,
}: UsePreviewImagesProps) {
  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({
    "3d": "loading",
    pcb: "loading",
    schematic: "loading",
  })

  const views = useMemo(
    () => [
      {
        id: "3d",
        label: "3D View",
        imageUrl: packageName
          ? `https://registry-api.tscircuit.com/snippets/images/${packageName}/3d.png`
          : undefined,
      },
      {
        id: "pcb",
        label: "PCB View",
        imageUrl: packageName
          ? `https://registry-api.tscircuit.com/snippets/images/${packageName}/pcb.png`
          : undefined,
      },
      {
        id: "schematic",
        label: "Schematic View",
        imageUrl: packageName
          ? `https://registry-api.tscircuit.com/snippets/images/${packageName}/schematic.png`
          : undefined,
      },
    ],
    [packageName],
  )

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

  const handleViewClick = (viewId: string) => {
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  const availableViews = views
    .map((view) => ({
      ...view,
      status: imageStatus[view.id],
    }))
    .filter((view) => view.status !== "error")

  return {
    availableViews,
    handleImageLoad,
    handleImageError,
    handleViewClick,
  }
}
