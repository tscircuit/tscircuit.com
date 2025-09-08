import { Skeleton } from "@/components/ui/skeleton"
import { usePackageReleaseImages } from "@/hooks/use-package-release-images"
import type { Package } from "fake-snippets-api/lib/db/schema"

interface ViewPlaceholdersProps {
  packageInfo?: Pick<Package, "name" | "latest_package_release_fs_sha">
  onViewChange?: (view: "3d" | "pcb" | "schematic") => void
}

export default function PreviewImageSquares({
  packageInfo,
  onViewChange,
}: ViewPlaceholdersProps) {
  const { availableViews: viewsToRender } = usePackageReleaseImages({
    packageName: packageInfo?.name,
    fsSha: packageInfo?.latest_package_release_fs_sha ?? "",
  })

  const handleViewClick = (viewId: string) => {
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {viewsToRender.map((view: any) => (
        <button
          key={view.id}
          className={`aspect-square ${view.backgroundClass ?? "bg-gray-100"} rounded-lg border border-gray-200 dark:border-[#30363d] flex items-center justify-center transition-colors overflow-hidden mb-6`}
          onClick={() => handleViewClick(view.id)}
        >
          {view.status === "loading" && (
            <Skeleton className="w-full h-full rounded-lg" />
          )}
          {view.imageUrl && (
            <img
              src={view.imageUrl}
              alt={view.label}
              className={`w-full h-full object-cover rounded-lg ${
                view.status === "loaded" ? "block" : "hidden"
              }`}
              onLoad={view.onLoad}
              onError={view.onError}
            />
          )}
        </button>
      ))}
    </div>
  )
}
