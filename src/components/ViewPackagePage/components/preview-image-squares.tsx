import { usePreviewImages } from "@/hooks/use-preview-images"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface ViewPlaceholdersProps {
  packageInfo?: Pick<
    Package,
    "name" | "latest_package_release_fs_sha" | "latest_package_release_id"
  >
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
