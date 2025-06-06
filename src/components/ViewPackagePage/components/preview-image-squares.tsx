"use client"
import { Skeleton } from "@/components/ui/skeleton"
import { usePreviewImages } from "@/hooks/use-preview-images"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface ViewPlaceholdersProps {
  packageInfo?: Pick<Package, "name" | "latest_package_release_fs_sha">
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
}

export default function PreviewImageSquares({
  packageInfo,
  onViewChange,
}: ViewPlaceholdersProps) {
  const { availableViews } = usePreviewImages({
    packageName: packageInfo?.name,
    fsMapHash: packageInfo?.latest_package_release_fs_sha ?? "",
  })

  const handleViewClick = (viewId: string) => {
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {availableViews.map((view) => (
        <button
          key={view.id}
          className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors overflow-hidden mb-6`}
          onClick={() => handleViewClick(view.id)}
        >
          {view.imageUrl && (
            <>
              {view.status === "loading" && (
                <Skeleton className="w-full h-full rounded-lg" />
              )}
              <img
                src={view.imageUrl}
                alt={view.label}
                className={`w-full h-full object-cover rounded-lg ${
                  view.status === "loaded" ? "block" : "hidden"
                }`}
                onLoad={view.onLoad}
                onError={view.onError}
              />
            </>
          )}
        </button>
      ))}
    </div>
  )
}
