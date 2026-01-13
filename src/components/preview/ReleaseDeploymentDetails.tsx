import { useTscircuitStatus } from "@/hooks/use-tscircuit-status"
import {
  Globe,
  User,
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
} from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

type BuildStatus = "success" | "error" | "building" | "queued" | "pending"

interface ReleaseDeploymentDetailsProps {
  pkg: Package
  packageRelease: PublicPackageRelease
  latestBuild: PackageBuild | null
  status: BuildStatus
  canManagePackage?: boolean
  isRebuildLoading?: boolean
  onRebuild?: () => void
}

export function ReleaseDeploymentDetails({
  pkg,
  packageRelease,
  latestBuild,
  status,
  canManagePackage = false,
  isRebuildLoading = false,
  onRebuild,
}: ReleaseDeploymentDetailsProps) {
  const { data: statusData } = useTscircuitStatus()
  const userCodeStatus = statusData?.checks.find(
    (c) => c.service === "usercode_api",
  )

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
        {/* Images Section - Main Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-4 md:p-6 flex flex-col justify-center">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div
                  key={img.label}
                  className={`relative border rounded-lg overflow-hidden bg-gray-50 group flex flex-col items-center justify-center ${
                    idx === 0 && images.length === 3
                      ? "col-span-2 aspect-[2/1]"
                      : "col-span-1 aspect-[4/3]"
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center p-4">
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
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 md:h-full select-none bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
              <Box className="w-10 h-10 mb-2 opacity-50" />
              <p>No preview images available</p>
            </div>
          )}
        </div>

        {/* Details Section - Secondary Card */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6 h-full">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Created
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
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
              <div className="flex items-center gap-2">
                {status === "success" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                ) : status === "error" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                ) : status === "building" ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {status === "success"
                    ? "Ready"
                    : status === "error"
                      ? "Failed"
                      : status === "building"
                        ? "Building"
                        : status === "pending"
                          ? "Pending"
                          : "Queued"}
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
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(latestBuild.user_code_job_completed_at)}
                  </span>
                )}
              </div>
            </div>

            {/* T ype */}
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
            {packageRelease.package_release_website_url && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Domains
                </p>
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
              </div>
            )}

            {/* Builder Status */}
            <div className="space-y-1.5 pt-4 col-span-full border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Builder Status
              </p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    userCodeStatus?.status === "ok"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-900">
                  {userCodeStatus?.status === "ok" ? "Operational" : "Degraded"}
                </span>
                {userCodeStatus?.error && (
                  <span
                    className="text-xs text-red-500 ml-1 truncate"
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
