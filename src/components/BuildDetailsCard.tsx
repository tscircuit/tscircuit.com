import {
  Clock,
  Globe,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  GitBranch,
  GitCommit,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import type {
  Package,
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"

type BuildStatus = "success" | "error" | "building" | "queued" | "pending"

interface BuildDetailsCardProps {
  pkg: Package
  packageRelease: PublicPackageRelease
  latestBuild: PackageBuild | null
  status: BuildStatus
  availableViews: Array<{
    id: string
    label: string
    imageUrl: string
    isLoading: boolean
  }>
}

export function BuildDetailsCard({
  pkg,
  packageRelease,
  latestBuild,
  status,
  availableViews,
}: BuildDetailsCardProps) {
  const buildDuration =
    latestBuild?.user_code_job_started_at &&
    latestBuild?.user_code_job_completed_at
      ? Math.floor(
          (new Date(latestBuild.user_code_job_completed_at).getTime() -
            new Date(latestBuild.user_code_job_started_at).getTime()) /
            1000,
        )
      : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Preview Image */}
          {Boolean(latestBuild) &&
            status !== "error" &&
            availableViews.length > 0 && (
              <div className="flex-shrink-0 w-full lg:w-64 h-40 border rounded-lg overflow-hidden bg-gray-50">
                {availableViews[0]?.isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : (
                  <img
                    src={availableViews[0]?.imageUrl}
                    alt="Preview"
                    className={`w-full h-full object-contain ${
                      availableViews[0]?.label.toLowerCase() === "pcb"
                        ? "bg-black"
                        : availableViews[0]?.label.toLowerCase() === "schematic"
                          ? "bg-[#F5F1ED]"
                          : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            )}

          {/* Details Grid */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
              {/* Created */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Created
                </p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <a
                    href={`https://github.com/${pkg.owner_github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    {pkg.owner_github_username || "Unknown"}
                  </a>
                  {latestBuild?.created_at && (
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(latestBuild.created_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  {status === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  ) : status === "building" ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium">
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
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Duration
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">
                    {buildDuration !== null ? `${buildDuration}s` : "N/A"}
                  </span>
                </div>
              </div>

              {/* Source */}
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Source
                </p>
                {pkg.github_repo_full_name ? (
                  <div className="flex items-center gap-2">
                    {packageRelease.is_pr_preview ? (
                      <GitBranch className="w-4 h-4 text-gray-400" />
                    ) : (
                      <GitCommit className="w-4 h-4 text-gray-400" />
                    )}
                    <a
                      href={
                        packageRelease.is_pr_preview
                          ? `https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease.github_pr_number}`
                          : `https://github.com/${pkg.github_repo_full_name}/tree/${packageRelease.github_branch_name || "main"}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {packageRelease.is_pr_preview
                        ? `PR #${packageRelease.github_pr_number}`
                        : packageRelease.github_branch_name || "main"}
                    </a>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>

            {/* Domains Section */}
            {packageRelease.package_release_website_url && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Domains
                </p>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={packageRelease.package_release_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {packageRelease.package_release_website_url.replace(
                      /^https?:\/\//,
                      "",
                    )}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
