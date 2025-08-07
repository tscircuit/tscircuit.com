import { Tag, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { timeAgo } from "@/lib/utils/timeAgo"
import { BuildStatus, BuildStep } from "./build-status"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { getBuildStatus, StatusIcon } from "@/components/preview"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import { useLatestPackageBuildByReleaseId } from "@/hooks/use-package-builds"

function getTranspilationStatus(
  pr?: PackageRelease | null,
): BuildStep["status"] {
  switch (pr?.transpilation_display_status) {
    case "complete":
      return "success"
    case "error":
      return "error"
    case "building":
      return "running"
    default:
      return "pending"
  }
}

function getCircuitJsonStatus(pr?: PackageRelease | null): BuildStep["status"] {
  switch (pr?.circuit_json_build_display_status) {
    case "complete":
      return "success"
    case "error":
      return "error"
    case "building":
      return "running"
    default:
      return "pending"
  }
}

export default function SidebarReleasesSection() {
  const { packageInfo } = useCurrentPackageInfo()
  const { data: packageRelease } = usePackageReleaseById(
    packageInfo?.latest_package_release_id,
  )
  const { data: latestBuild } = useLatestPackageBuildByReleaseId(
    packageRelease?.package_release_id,
  )

  const buildSteps: BuildStep[] = [
    {
      id: "package_transpilation",
      name: "Package Transpilation",
      status: getTranspilationStatus(packageRelease),
    },
    {
      id: "circuit_json_build",
      name: "Circuit JSON Build",
      status: getCircuitJsonStatus(packageRelease),
    },
  ]

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

  const { status, label } = latestBuild
    ? getBuildStatus(latestBuild)
    : { status: "pending", label: "pending" }
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">
        <PrefetchPageLink
          href={`/${packageInfo?.owner_github_username}/${packageInfo?.unscoped_name}/releases`}
          className="hover:underline"
        >
          Releases
        </PrefetchPageLink>
      </h2>
      <div className="flex flex-col space-y-2">
        <PrefetchPageLink
          href={`/${packageInfo?.owner_github_username}/${packageInfo?.unscoped_name}/releases`}
          className="flex items-center hover:underline"
        >
          <Tag className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span className="text-sm font-medium">v{packageRelease.version}</span>
        </PrefetchPageLink>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span className="text-sm text-gray-500 dark:text-[#8b949e]">
            {timeAgo(new Date(packageRelease.created_at))}
          </span>
        </div>
        {buildSteps.map((step) => (
          <BuildStatus
            key={step.id}
            step={step}
            packageReleaseId={packageRelease.package_release_id}
          />
        ))}
        {latestBuild && (
          <PrefetchPageLink
            href={`/build/${latestBuild.package_build_id}`}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#8b949e]"
          >
            <StatusIcon status={status} />
            <span>Package Preview {label}</span>
          </PrefetchPageLink>
        )}
      </div>
      {/* <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm">
        Push a new release
      </a> */}
    </div>
  )
}
