import { Skeleton } from "@/components/ui/skeleton"
import { usePackageReleaseImages } from "@/hooks/use-package-release-images"
import { usePreviewImages } from "@/hooks/use-preview-images"
import { usePackageFiles } from "@/hooks/use-package-files"
import {
  normalizeSvgForSquareTile,
  svgToDataUrl,
} from "@/lib/normalize-svg-for-tile"
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
  const { data: releaseFiles } = usePackageFiles(
    packageInfo?.latest_package_release_id,
  )
  const availableFilePaths = releaseFiles?.map((f) => f.file_path)
  const { availableViews: imageViews } = usePackageReleaseImages({
    packageReleaseId: packageInfo?.latest_package_release_id,
  })

  const { availableViews: pngViews } = usePreviewImages({
    packageName: packageInfo?.name,
    fsMapHash: packageInfo?.latest_package_release_fs_sha ?? "",
  })

  const viewsToRender =
    imageViews.length === 0 ||
    imageViews.every((v) => !v.isLoading && !v.imageUrl)
      ? (pngViews as any)
      : imageViews

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
          {(view.isLoading || view.status === "loading") && (
            <Skeleton className="w-full h-full rounded-lg" />
          )}
          {view.svg && !view.status && (
            <img
              src={svgToDataUrl(normalizeSvgForSquareTile(view.svg))}
              alt={view.label}
              className="w-full h-full object-contain"
            />
          )}
          {view.imageUrl && !view.isLoading && (
            <img
              src={view.imageUrl}
              alt={view.label}
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
