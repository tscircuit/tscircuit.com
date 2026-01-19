import { useState, useEffect } from "react"
import { GitCommit, ExternalLink, RefreshCw } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import type {
  Package,
  PackageBuild,
  PublicPackageRelease,
  PublicOrgSchema,
} from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from "wouter"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
import { getBuildStatus, StatusIcon } from "."
import { getStepDuration } from "@/lib/utils/getStepDuration"

interface BuildDeploymentDetailsProps {
  pkg: Package
  packageRelease: PublicPackageRelease
  packageBuild: PackageBuild
  canManagePackage?: boolean
  isRebuildLoading?: boolean
  isPollingAfterRebuild?: boolean
  onRebuild?: () => void
  organization?: PublicOrgSchema | null
}

export function BuildDeploymentDetails({
  pkg,
  packageRelease,
  packageBuild,
  canManagePackage = false,
  isRebuildLoading = false,
  isPollingAfterRebuild = false,
  onRebuild,
  organization,
}: BuildDeploymentDetailsProps) {
  const buildStatus = getBuildStatus(packageBuild)
  const isWaitingForBuild =
    isPollingAfterRebuild && buildStatus.status !== "building"
  const isBuildInProgress =
    buildStatus.status === "building" || isWaitingForBuild

  const [waitingSeconds, setWaitingSeconds] = useState(0)

  useEffect(() => {
    if (!isWaitingForBuild) {
      setWaitingSeconds(0)
      return
    }

    setWaitingSeconds(1)
    const interval = setInterval(() => {
      setWaitingSeconds((s) => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isWaitingForBuild])

  const buildDuration = getStepDuration(
    packageBuild?.user_code_job_started_at,
    packageBuild?.user_code_job_completed_at,
  )

  const isLatestBuild =
    packageRelease.latest_package_build_id === packageBuild.package_build_id

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl sm:text-3xl font-semibold select-none text-gray-900 tracking-tight">
            Build {packageBuild.package_build_id.slice(0, 8)}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href={`/${pkg.name}/releases/${packageRelease.version || packageRelease.package_release_id}`}
              className="hover:text-blue-600 hover:underline"
            >
              Release v{packageRelease.version}
            </Link>
            {isLatestBuild && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded border border-gray-200">
                Latest Build
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {canManagePackage && (
            <TooltipProvider>
              <Tooltip open={isWaitingForBuild ? undefined : false}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-gray-50 flex-shrink-0"
                    disabled={
                      isRebuildLoading ||
                      buildStatus.status === "building" ||
                      !packageRelease
                    }
                    onClick={onRebuild}
                  >
                    <RefreshCw
                      className={`size-3 sm:size-4 mr-2 ${isRebuildLoading || isBuildInProgress ? "animate-spin" : ""}`}
                    />
                    {buildStatus.status === "building"
                      ? "Building..."
                      : isRebuildLoading
                        ? "Triggering..."
                        : isWaitingForBuild
                          ? `Waiting (${waitingSeconds}s)`
                          : "Rebuild"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Click to trigger a new build</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {packageBuild.package_build_website_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                window.open(packageBuild.package_build_website_url!, "_blank")
              }}
            >
              <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              Visit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Owner
          </p>
          <div className="flex items-center gap-1">
            <GithubAvatarWithFallback
              username={
                organization?.tscircuit_handle || pkg.org_owner_tscircuit_handle
              }
              imageUrl={organization?.avatar_url}
              className="size-8 sm:size-6 flex-shrink-0 border border-gray-200"
              fallbackClassName="text-xs sm:text-sm font-medium"
              colorClassName="bg-gray-100 text-gray-600"
            />
            <div className="flex flex-col min-w-0">
              <Link
                href={`/${pkg.org_owner_tscircuit_handle}`}
                className="text-sm font-medium hover:text-blue-600 leading-tight truncate"
              >
                {pkg.org_owner_tscircuit_handle || "Unknown"}
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Status
          </p>
          <div className="flex items-center gap-1">
            <StatusIcon size={4} status={buildStatus.status} />
            <span className="text-sm font-medium text-gray-900">
              {buildStatus.label}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Duration
          </p>
          <div className="flex items-center gap-2 text-gray-900">
            {buildDuration ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium cursor-default">
                      {buildDuration}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {packageBuild.user_code_job_completed_at &&
                      formatTimeAgo(packageBuild.user_code_job_completed_at)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-sm font-medium">—</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Created
          </p>
          <div className="flex items-center text-gray-900">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-medium cursor-default">
                    {formatTimeAgo(packageBuild.created_at)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(packageBuild.created_at).toLocaleString()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-gray-50">
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Build ID
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-mono text-gray-900 cursor-default truncate">
                    {packageBuild.package_build_id}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Release Version
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <GitCommit className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Link
              href={`/${pkg.name}/releases/${packageRelease.version || packageRelease.package_release_id}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
            >
              v
              {packageRelease.version ||
                packageRelease.package_release_id.slice(-6)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
