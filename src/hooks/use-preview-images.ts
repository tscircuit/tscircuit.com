import { useEffect, useState } from "react"

interface UsePreviewImagesProps {
  cadPreviewUrl?: string | null
  pcbPreviewUrl?: string | null
  schematicPreviewUrl?: string | null
}

export function usePreviewImages({
  cadPreviewUrl,
  pcbPreviewUrl,
  schematicPreviewUrl,
}: UsePreviewImagesProps) {
  const [imageStatus, setImageStatus] = useState<
    Record<string, "loading" | "loaded" | "error">
  >({
    "3d": cadPreviewUrl ? "loading" : "error",
    pcb: pcbPreviewUrl ? "loading" : "error",
    schematic: schematicPreviewUrl ? "loading" : "error",
  })

  useEffect(() => {
    setImageStatus({
      "3d": cadPreviewUrl ? "loading" : "error",
      pcb: pcbPreviewUrl ? "loading" : "error",
      schematic: schematicPreviewUrl ? "loading" : "error",
    })
  }, [cadPreviewUrl, pcbPreviewUrl, schematicPreviewUrl])

  const views = [
    {
      id: "3d",
      label: "3D View",
      backgroundClass: "bg-gray-100",
      imageUrl: cadPreviewUrl ?? undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      backgroundClass: "bg-black",
      imageUrl: pcbPreviewUrl ?? undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl: schematicPreviewUrl ?? undefined,
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
    .filter((view) => Boolean(view.imageUrl))
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
