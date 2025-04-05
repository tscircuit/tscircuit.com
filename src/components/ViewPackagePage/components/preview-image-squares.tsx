"use client"

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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  const views = [
    {
      id: "3d",
      label: "3D View",
      imageUrl: `https://registry-api.tscircuit.com/snippets/images/${packageInfo?.name}/3d.png`,
    },
    {
      id: "pcb",
      label: "PCB View",
      imageUrl: `https://registry-api.tscircuit.com/snippets/images/${packageInfo?.name}/pcb.png`,
    },
    {
      id: "schematic",
      label: "Schematic View",
      imageUrl: `https://registry-api.tscircuit.com/snippets/images/${packageInfo?.name}/schematic.png`,
    },
  ] satisfies {
    id: "3d" | "pcb" | "schematic"
    label: string
    imageUrl?: string
  }[]

  const isAnyImageLoaded = views.some((view) => loadedImages[view.id])

  const handleViewClick = (viewId: string) => {
    setActiveView(viewId)
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  const handleImageLoad = (viewId: string) => {
    setLoadedImages((prev) => ({ ...prev, [viewId]: true }))
  }

  const handleImageError = (viewId: string) => {
    console.error(`Failed to load image for view: ${viewId}`)
    setLoadedImages((prev) => ({ ...prev, [viewId]: false }))
  }

  return (
    <div className={`grid grid-cols-3 gap-2 ${isAnyImageLoaded && "mb-6"}`}>
      {views.map(
        (view) =>
          view.imageUrl && (
            <button
              key={view.id}
              className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors ${
                loadedImages[view.id] ? "" : "hidden"
              }`}
              onClick={() => handleViewClick(view.id)}
            >
              <img
                src={view.imageUrl}
                alt={view.label}
                className="w-full h-full object-cover"
                onLoad={() => handleImageLoad(view.id)}
                onError={() => handleImageError(view.id)}
              />
            </button>
          ),
      )}
    </div>
  )
}
