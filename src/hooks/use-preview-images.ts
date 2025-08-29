import { useState } from "react"

interface UsePreviewImagesProps {
  packageName?: string
  fsMapHash?: string
}

export function usePreviewImages({
  packageName,
  fsMapHash,
}: UsePreviewImagesProps) {
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
      imageUrl: packageName
        ? `https://api.tscircuit.com/packages/images/${packageName}/3d.png?fs_sha=${fsMapHash}`
        : undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      backgroundClass: "bg-black",
      imageUrl: packageName
        ? `https://api.tscircuit.com/packages/images/${packageName}/pcb.png?fs_sha=${fsMapHash}`
        : undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      backgroundClass: "bg-[#F5F1ED]",
      imageUrl: packageName
        ? `https://api.tscircuit.com/packages/images/${packageName}/schematic.png?fs_sha=${fsMapHash}`
        : undefined,
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
