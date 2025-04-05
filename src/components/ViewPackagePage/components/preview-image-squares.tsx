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
  const [loadedViews, setLoadedViews] = useState<string[]>([])

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
  ]

  const handleViewClick = (viewId: string) => {
    setActiveView(viewId)
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  const handleImageLoad = (viewId: string) => {
    setLoadedViews((prev) => [...prev, viewId])
  }

  const handleImageError = (viewId: string) => {
    setLoadedViews((prev) => prev.filter((id) => id !== viewId))
  }

  return loadedViews.length > 0 ? (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {views.map(
        (view) =>
          loadedViews.includes(view.id) && (
            <button
              key={view.id}
              className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors`}
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
  ) : null
}
