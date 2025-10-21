import { usePreviewImages } from "@/hooks/use-preview-images"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface ViewPlaceholdersProps {
  pkg?: Package
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
  large?: boolean
}

export default function PreviewImageSquares({
  pkg,
  onViewChange,
  large = false,
}: ViewPlaceholdersProps) {
  const { availableViews } = usePreviewImages({
    pkg: pkg,
  })
  const handleViewClick = (viewId: string) => {
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }
  if (large) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {availableViews.map((view) => (
          <button
            onClick={() => handleViewClick(view.id)}
            key={view.id}
            className={`aspect-square ${view.status == "loading" ? "bg-slate-900/10 animate-pulse" : (view.backgroundClass ?? "bg-gray-100")} rounded-lg border border-gray-200 dark:border-[#30363d] flex items-center justify-center transition-colors mt-4 overflow-hidden`}
          >
            {view.imageUrl && (
              <img
                src={view.imageUrl}
                className="w-full h-full object-cover rounded-lg"
                onLoad={view.onLoad}
                onError={view.onError}
              />
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {availableViews.map((view) => (
        <button
          key={view.id}
          className={`aspect-square ${view.status == "loading" ? "bg-slate-900/10 animate-pulse" : (view.backgroundClass ?? "bg-gray-100")} rounded-lg border border-gray-200 dark:border-[#30363d] flex items-center justify-center transition-colors overflow-hidden mb-6`}
          onClick={() => handleViewClick(view.id)}
        >
          {view.imageUrl && (
            <img
              src={view.imageUrl}
              className="w-full h-full object-cover rounded-lg"
              onLoad={view.onLoad}
              onError={view.onError}
            />
          )}
        </button>
      ))}
    </div>
  )
}
