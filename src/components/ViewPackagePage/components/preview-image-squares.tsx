import { Skeleton } from "@/components/ui/skeleton"
import { usePackageReleaseImages } from "@/hooks/use-package-release-images"
import { usePreviewImages } from "@/hooks/use-preview-images"
import { usePackageFiles } from "@/hooks/use-package-files"
import { normalizeSvgForSquareTile } from "@/lib/normalize-svg-for-tile"
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
  const { availableViews: svgViews } = usePackageReleaseImages({
    packageReleaseId: packageInfo?.latest_package_release_id,
    availableFilePaths,
  })

  const { availableViews: pngViews } = usePreviewImages({
    packageName: packageInfo?.name,
    fsMapHash: packageInfo?.latest_package_release_fs_sha ?? "",
  })

  const viewsToRender =
    svgViews.length === 0 ||
    svgViews.every((v) => !v.isLoading && !(v as any).svg)
      ? (pngViews as any)
      : (svgViews as any)

  const handleViewClick = (viewId: string) => {
    onViewChange?.(viewId as "3d" | "pcb" | "schematic")
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {viewsToRender.map((view: any) => (
        <button
          key={view.id}
          className={`aspect-square bg-gray-100 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-[#21262d] flex items-center justify-center transition-colors overflow-hidden mb-6`}
          onClick={() => handleViewClick(view.id)}
        >
          {(view.isLoading || view.status === "loading") && (
            <Skeleton className="w-full h-full rounded-lg" />
          )}
          {view.svg && !view.status && (
            <div
              className={`w-full h-full ${view.svg ? "block" : "hidden"} [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:max-w-full [&>svg]:max-h-full`}
              dangerouslySetInnerHTML={{ __html: normalizeSvgForSquareTile(view.svg) }}
            />
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
