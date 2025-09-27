import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, Rocket, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "wouter"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { getBuildStatus, StatusIcon } from "."
import { Package } from "fake-snippets-api/lib/db/schema"
import { usePackageBuild } from "@/hooks/use-package-builds"
import {
  useLatestPackageRelease,
  usePackageReleaseById,
} from "@/hooks/use-package-release"

export const ConnectedPackageCardSkeleton = () => {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "border border-gray-200",
        "hover:border-gray-300",
        "bg-white shadow-none",
        "p-6",
        "flex flex-col",
        "min-h-[200px]",
        "animate-pulse",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-gray-200 rounded" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="w-16 h-5 bg-gray-200 rounded-full" />
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 bg-gray-200 rounded" />
        <div className="w-48 h-5 bg-gray-200 rounded" />
      </div>

      <div className="mb-6 flex-1">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="flex items-center gap-2">
          <div className="w-32 h-4 bg-gray-200 rounded" />
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full mt-auto">
        <div className="w-full h-9 bg-gray-200 rounded" />
        <div className="w-full h-9 bg-gray-200 rounded" />
      </div>
    </Card>
  )
}

// Custom hook to get latest package build info
const useLatestPackageBuildInfo = (packageId: string) => {
  const { data: latestRelease, isLoading: releaseLoading } =
    useLatestPackageRelease(packageId)
  const { data: latestBuild, isLoading: buildLoading } = usePackageBuild(
    latestRelease?.latest_package_build_id || null,
  )

  return {
    data: latestBuild,
    isLoading:
      releaseLoading ||
      (latestRelease?.latest_package_build_id && buildLoading),
  }
}

export const ConnectedPackageCard = ({
  pkg,
  className,
}: {
  pkg: Package
  className?: string
}) => {
  const { data: latestBuildInfo, isLoading } = useLatestPackageBuildInfo(
    pkg.package_id,
  )

  const { data: packageRelease } = usePackageReleaseById(
    latestBuildInfo?.package_release_id,
  )

  if (isLoading && !latestBuildInfo) {
    return <ConnectedPackageCardSkeleton />
  }

  const { status, label } = latestBuildInfo
    ? getBuildStatus(latestBuildInfo)
    : { status: "pending", label: "Pending" }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "border border-gray-200",
        "hover:border-gray-300",
        "bg-white shadow-none",
        "p-6",
        "flex flex-col",
        "min-h-[200px]",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${pkg.owner_github_username}/${pkg.unscoped_name}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {pkg.unscoped_name}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant={
              status === "success"
                ? "default"
                : status === "error"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs flex items-center"
          >
            {label}
          </Badge>
          <div className="flex items-center justify-center">
            <StatusIcon status={status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Github className="w-4 h-4 text-gray-600" />
        <Link
          href={`https://github.com/${pkg.github_repo_full_name}`}
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          {pkg.github_repo_full_name}
        </Link>
      </div>

      <div className="mb-6 flex-1">
        {packageRelease?.commit_message && (
          <h4
            title={packageRelease.commit_message}
            className="text-sm font-medium truncate text-gray-900 mb-2"
          >
            {packageRelease.commit_message}
          </h4>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{formatTimeAgo(String(latestBuildInfo?.created_at))} on</span>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
              {packageRelease?.branch_name || "main"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full mt-auto">
        <Link className="w-full" href={`/${pkg.name}/releases`}>
          <Button
            size="sm"
            className="bg-blue-600 w-full hover:bg-blue-700 text-white px-4 py-2"
          >
            View
          </Button>
        </Link>
        {latestBuildInfo?.preview_url &&
          latestBuildInfo?.package_build_id &&
          status === "success" && (
            <Link
              className="w-full"
              href={`/${pkg.name}/releases/${latestBuildInfo.package_release_id}/preview`}
            >
              <Button size="sm" variant="outline" className="px-4 py-2 w-full">
                Preview
              </Button>
            </Link>
          )}
      </div>
    </Card>
  )
}

export const ConnectedPackagesList = ({
  packages,
}: { packages: Package[] }) => {
  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-black">
        <Rocket className="w-12 h-12 mb-4 text-black" />
        <h3 className="text-xl font-semibold mb-3">
          No Connected Repositories
        </h3>
        <p className="text-sm text-center max-w-md text-gray-600">
          Connect your GitHub repositories to start building and deploying your
          circuits. Your connected repositories and builds will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <ConnectedPackageCard key={pkg.package_id} pkg={pkg} />
        ))}
      </div>
    </div>
  )
}
