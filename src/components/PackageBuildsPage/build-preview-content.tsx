import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"

export function BuildPreviewContent() {
  const { packageRelease } = useCurrentPackageRelease()
  const { packageInfo } = useCurrentPackageInfo()

  if (!packageRelease) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-48 h-48 bg-gray-200 rounded animate-pulse-slow"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <div className="rounded overflow-hidden">
        <img
          src={`https://api.tscircuit.com/packages/images/${packageInfo?.name}/pcb.png`}
          alt="Package build preview"
          className="object-contain rounded max-h-[360px]"
        />
      </div>
    </div>
  )
}
