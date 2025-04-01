"use client"

import { useState } from "react"

interface ViewPlaceholdersProps {
  onViewChange: (view: string) => void
}

export default function ViewPlaceholders({ onViewChange }: ViewPlaceholdersProps) {
  const [activeView, setActiveView] = useState("code")

  const views = [
    { id: "3d", label: "3D View" },
    { id: "pcb", label: "PCB View" },
    { id: "schematic", label: "Schematic View" },
  ]

  const handleViewClick = (viewId: string) => {
    setActiveView(viewId)
    onViewChange(viewId)
  }

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {views.map((view) => (
        <button
          key={view.id}
          className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border ${
            activeView === view.id ? "border-blue-500 dark:border-[#58a6ff]" : "border-gray-200 dark:border-[#30363d]"
          } hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors`}
          onClick={() => handleViewClick(view.id)}
        >
          <span className="text-xs font-medium text-gray-700 dark:text-[#c9d1d9]">{view.label}</span>
        </button>
      ))}
    </div>
  )
}

