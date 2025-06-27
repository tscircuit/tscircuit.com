import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"

export function BuildPreviewContent() {
  const { packageRelease } = useCurrentPackageRelease({ refetchInterval: 2000 })
  const { packageInfo } = useCurrentPackageInfo()

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
        <img
          src={`https://api.tscircuit.com/packages/images/${packageInfo?.name}/pcb.png`}
          alt="Package build preview"
          className="object-contain rounded w-full h-auto max-h-[240px] sm:max-h-[300px] lg:max-h-[360px]"
        />
      </div>
    </div>
  )
}
