"use client"
import { Skeleton } from "@/components/ui/skeleton"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useState } from "react"

interface ViewPlaceholdersProps {
  packageInfo?: Pick<Package, "name">
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
}

export default function PreviewImageSquares({
  packageInfo,
  onViewChange,
}: ViewPlaceholdersProps) {
  const [activeView, setActiveView] = useState("code")
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
      imageUrl: packageInfo?.name
        ? `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/3d.png`
        : undefined,
    },
    {
      id: "pcb",
      label: "PCB View",
      imageUrl: packageInfo?.name
        ? `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/pcb.png`
        : undefined,
    },
    {
      id: "schematic",
      label: "Schematic View",
      imageUrl: packageInfo?.name
        ? `https://registry-api.tscircuit.com/snippets/images/${packageInfo.name}/schematic.png`
        : undefined,
    },
  ] satisfies {
    id: "3d" | "pcb" | "schematic"
    label: string
    imageUrl?: string
  }[]

  const handleViewClick = (viewId: string) => {
    setActiveView(viewId)
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

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

  const availableViews = views.filter(
    (view) => !view.imageUrl || imageStatus[view.id] !== "error",
  )

  const isAnyImageLoaded = Object.values(imageStatus).includes("loaded")

  return (
    <div className={`grid grid-cols-3 gap-2 ${isAnyImageLoaded && "mb-6"}`}>
      {availableViews.map((view) => (
        <button
          key={view.id}
          className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors`}
          onClick={() => handleViewClick(view.id)}
        >
          {view.imageUrl && (
            <>
              {imageStatus[view.id] === "loading" && (
                <Skeleton className="w-full h-full rounded-lg" />
              )}

              <img
                src={view.imageUrl}
                alt={view.label}
                className={`w-full h-full object-cover rounded-lg ${imageStatus[view.id] === "loaded" ? "block" : "hidden"}`}
                onLoad={() => handleImageLoad(view.id)}
                onError={() => handleImageError(view.id)}
              />
            </>
          )}
        </button>
      ))}
    </div>
  )
}
