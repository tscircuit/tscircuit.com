import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useState } from "react"
import { CircuitBoard } from "lucide-react"

export function BuildPreviewContent() {
  const { packageRelease } = useCurrentPackageRelease({ refetchInterval: 2000 })
  const { packageInfo } = useCurrentPackageInfo()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  if (!packageRelease) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-200 rounded animate-pulse-slow"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="rounded overflow-hidden w-full max-w-full">
        {imageError ? (
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-300 rounded-lg p-8 sm:p-12 lg:p-16 min-h-[240px] sm:min-h-[300px] lg:min-h-[360px]">
            <CircuitBoard className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">
              Preview Not Available
            </h3>
            <p className="text-sm sm:text-base text-gray-500 text-center max-w-sm">
              The build preview image could not be loaded. This may be because
              the build is still processing or the image is not available.
            </p>
          </div>
        ) : (
          <>
            {imageLoading && (
              <div className="flex items-center justify-center bg-gray-100 rounded-lg min-h-[240px] sm:min-h-[300px] lg:min-h-[360px]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
            <img
              src={`https://api.tscircuit.com/packages/images/${packageInfo?.name}/pcb.png`}
              alt="Package build preview"
              className={`object-contain rounded w-full h-auto max-h-[240px] sm:max-h-[300px] lg:max-h-[360px] ${imageLoading ? "hidden" : "block"}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
          </>
        )}
      </div>
    </div>
  )
}
