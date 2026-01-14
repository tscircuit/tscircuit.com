import { useUsercodeApiStatus } from "@/hooks/use-usercode-api-status"
import {
  Globe,
  GitBranch,
  GitCommit,
  ExternalLink,
  Box,
  Cpu,
  Layers,
  RefreshCw,
} from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import type {
  Package,
  PackageBuild,
  PublicPackageRelease,
  PublicOrgSchema,
} from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
import { getBuildStatus, StatusIcon } from "."

interface ReleaseDeploymentDetailsProps {
  pkg: Package
  packageRelease: PublicPackageRelease
  latestBuild: PackageBuild | null
  canManagePackage?: boolean
  isRebuildLoading?: boolean
  onRebuild?: () => void
  organization?: PublicOrgSchema | null
}

export function ReleaseDeploymentDetails({
  pkg,
  packageRelease,
  latestBuild,
  canManagePackage = false,
  isRebuildLoading = false,
  onRebuild,
  organization,
}: ReleaseDeploymentDetailsProps) {
  const { data: statusData } = useUsercodeApiStatus()
  const userCodeStatus = statusData?.checks.find(
    (c) => c.service === "usercode_api",
  )
  const buildStatus = getBuildStatus(latestBuild)

  const buildDuration =
    latestBuild?.user_code_job_started_at &&
    latestBuild?.user_code_job_completed_at
      ? Math.floor(
          (new Date(latestBuild.user_code_job_completed_at).getTime() -
            new Date(latestBuild.user_code_job_started_at).getTime()) /
            1000,
        )
      : null

  const images = [
    {
      label: "3D",
      url: packageRelease.cad_preview_image_url,
      icon: Box,
    },
    {
      label: "Schematic",
      url: packageRelease.sch_preview_image_url,
      icon: Layers,
    },
    {
      label: "PCB",
      url: packageRelease.pcb_preview_image_url,
      icon: Cpu,
    },
  ].filter((img) => img.url)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-gray-100 pb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold select-none text-gray-900 tracking-tight">
          Release Details
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {canManagePackage && (
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 bg-white hover:bg-gray-50 flex-shrink-0"
              disabled={isRebuildLoading || !packageRelease}
              onClick={onRebuild}
            >
              <RefreshCw
                className={`size-3 sm:size-4 mr-2 ${isRebuildLoading ? "animate-spin" : ""}`}
              />
              {isRebuildLoading ? "Rebuilding..." : "Rebuild"}
            </Button>
          )}
          {packageRelease.package_release_website_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                window.open(
                  packageRelease.package_release_website_url!,
                  "_blank",
                )
              }}
            >
              <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              Visit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images Section */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, idx) => {
                let bgColor = "bg-gray-50"
                if (img.label === "Schematic") bgColor = "bg-[#f5f1ed]"
                else if (img.label === "PCB") bgColor = "bg-black"
                else if (img.label === "3D") bgColor = "bg-gray-100"

                return (
                  <div
                    key={img.label}
                    className={`relative border rounded-lg overflow-hidden ${bgColor} group flex flex-col items-center justify-center ${
                      idx === 0 && images.length === 3
                        ? "col-span-2 aspect-[2/1]"
                        : "col-span-1 aspect-[4/3]"
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={img.url!}
                        alt={`${img.label} Preview`}
                        className="max-w-full max-h-full w-auto h-auto object-contain"
                      />
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-sm">
                      <img.icon className="w-3.5 h-3.5" />
                      {img.label}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 lg:h-full select-none bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
              <Box className="w-10 h-10 mb-2 opacity-50" />
              <p>No preview images available</p>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 h-full">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Owner
              </p>
              <div className="flex items-center gap-3">
                <GithubAvatarWithFallback
                  username={
                    organization?.tscircuit_handle ||
                    pkg.org_owner_tscircuit_handle
                  }
                  imageUrl={organization?.avatar_url}
                  className="size-8 sm:size-10 flex-shrink-0 border border-gray-200"
                  fallbackClassName="text-xs sm:text-sm font-medium"
                  colorClassName="bg-gray-100 text-gray-600"
                />
                <div className="flex flex-col min-w-0">
                  <Link
                    to={`/${pkg.org_owner_tscircuit_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-blue-600 leading-tight truncate"
                  >
                    {pkg.org_owner_tscircuit_handle || "Unknown"}
                  </Link>
                  {latestBuild?.created_at && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {formatTimeAgo(latestBuild.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
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

            {/* Duration */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Duration
              </p>
              <div className="flex items-center gap-2 text-gray-900">
                <span className="text-sm font-medium">
                  {buildDuration !== null ? `${buildDuration}s` : "—"}
                </span>
                {latestBuild?.user_code_job_completed_at && (
                  <span className="text-sm text-gray-500">
                    {formatTimeAgo(latestBuild.user_code_job_completed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Type
              </p>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {packageRelease.is_latest
                    ? "Latest"
                    : !packageRelease.is_pr_preview
                      ? "Preview"
                      : "Pull Request"}
                </span>
              </div>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Source
              </p>
              {pkg.github_repo_full_name ? (
                <div className="flex items-center gap-2 min-w-0">
                  {packageRelease.is_pr_preview ? (
                    <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <GitCommit className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <a
                    href={
                      packageRelease.is_pr_preview
                        ? `https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease.github_pr_number}`
                        : `https://github.com/${pkg.github_repo_full_name}/tree/${packageRelease.github_branch_name || "main"}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {packageRelease.is_pr_preview
                      ? `PR #${packageRelease.github_pr_number}`
                      : packageRelease.github_branch_name || "main"}
                  </a>
                </div>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>

            {/* Domains */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Domains
              </p>
              {packageRelease.package_release_website_url ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={packageRelease.package_release_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {packageRelease.package_release_website_url.replace(
                      /^https?:\/\//,
                      "",
                    )}
                  </a>
                </div>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>

            {/* Builder Status */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Builder Status
              </p>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <div
                  className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0 ${
                    userCodeStatus?.status === "ok"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <a
                  href="https://status.tscircuit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {userCodeStatus?.status === "ok" ? "Operational" : "Degraded"}
                </a>
                {userCodeStatus?.error && (
                  <span
                    className="text-xs text-red-500 truncate"
                    title={userCodeStatus.error}
                  >
                    ({userCodeStatus.error})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
