import { Tag, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { timeAgo } from "@/lib/utils/timeAgo"
import { BuildStatus } from "./build-status"

export default function SidebarReleasesSection() {
  const { packageInfo } = useCurrentPackageInfo()
  const { data: packageRelease } = usePackageReleaseById(
    packageInfo?.latest_package_release_id,
  )

  if (!packageRelease) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Releases</h2>
        <div className="mb-2">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mb-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Releases</h2>
      <div className="flex items-center mb-2">
        <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
        <span className="text-sm font-medium">v{packageRelease.version}</span>
      </div>
      <div className="flex items-center mb-3">
        <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
        <span className="text-sm text-gray-500 dark:text-[#8b949e]">
          {timeAgo(new Date(packageRelease.created_at))}
        </span>
      </div>
      {/* <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm">
        Push a new release
      </a> */}
      <BuildStatus
        steps={[
          // TODO: Add step for package transpilation
          {
            id: "package_transpilation",
            name: "Package Transpilation",
            status: "success",
            message: "TBD",
          },
          {
            id: "circuit_json_build",
            name: "Circuit JSON Build",
            status: packageRelease.circuit_json_build_error
              ? "failed"
              : "success",
            message: packageRelease.circuit_json_build_error || undefined,
          },
        ]}
      />
    </div>
  )
}
