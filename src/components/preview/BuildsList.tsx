import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GitBranch, MoreHorizontal, GitCommitHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getBuildStatus, StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { Package, PackageBuild } from "fake-snippets-api/lib/db/schema"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"

const formatBuildDuration = (
  startedAt?: string | null,
  completedAt?: string | null,
): string | null => {
  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const durationMs = end - start

  const seconds = Math.floor(durationMs / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export const BuildsList = ({ pkg }: { pkg: Package }) => {
  const { data: releases, isLoading: isLoadingReleases } =
    usePackageReleasesByPackageId(pkg.package_id)
  const axios = useAxios()
  const [, setLocation] = useLocation()
  // Get the latest build for each release to show status
  const latestBuildQueries = useQueries(
    (releases || [])
      .filter((release) => release.latest_package_build_id)
      .map((release) => ({
        queryKey: ["packageBuild", release.latest_package_build_id],
        queryFn: async () => {
          if (!release.latest_package_build_id) return null
          const { data } = await axios.get("/package_builds/get", {
            params: { package_build_id: release.latest_package_build_id },
          })
          return data.package_build
        },
        enabled: Boolean(release.latest_package_build_id),
        retry: false,
        refetchOnWindowFocus: false,
      })),
  )

  const isLoading =
    isLoadingReleases || latestBuildQueries.some((q) => q.isLoading)

  // Create a map of release ID to latest build for easy access
  const latestBuildsMap = new Map<string, PackageBuild>()

  latestBuildQueries.forEach((query, index) => {
    if (query.data && releases?.[index]) {
      latestBuildsMap.set(releases[index].package_release_id, query.data)
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Releases</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-[140px] max-w-[200px]">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex-shrink-0 w-[120px]">
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                  </div>
                ))
              : releases?.map((release) => {
                  const latestBuild = latestBuildsMap.get(
                    release.package_release_id,
                  )
                  const { status, label } = getBuildStatus(latestBuild)
                  const buildDuration = formatBuildDuration(
                    latestBuild?.user_code_started_at,
                    latestBuild?.user_code_completed_at,
                  )

                  return (
                    <div
                      key={release.package_release_id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setLocation(
                          `/${pkg.name}/releases/${release.package_release_id}`,
                        )
                      }}
                    >
                      {/* Release ID and Type */}
                      <div className="flex-1 min-w-[140px] max-w-[200px]">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {release.package_release_id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {release.is_pr_preview ? "Preview" : "Production"}
                          {release.is_latest && (
                            <span className="ml-2 text-xs text-blue-600 font-medium">
                              Current
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Status and Build Duration */}
                      <div className="flex-shrink-0 w-[120px]">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={status} />
                          <span
                            className={`text-sm font-medium ${
                              status === "success"
                                ? "text-cyan-600"
                                : status === "error"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 tabular-nums">
                          {buildDuration || "—"}
                        </p>
                      </div>

                      {/* Branch and Commit Info */}
                      <div className="flex-1 min-w-[200px]">
                        {pkg?.github_repo_full_name ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-gray-900">
                              <GitBranch className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-mono truncate">
                                {release.branch_name ||
                                  (release.is_pr_preview
                                    ? `pr-${release.github_pr_number}`
                                    : "main")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-900">
                              <GitCommitHorizontal className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm truncate">
                                <span className="font-mono">
                                  {release.package_release_id.slice(0, 7)}
                                </span>
                                {release.commit_message && (
                                  <span className="ml-1.5 text-gray-600 truncate">
                                    {release.commit_message.slice(0, 40)}
                                    {release.commit_message.length > 40
                                      ? "..."
                                      : ""}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No repository linked
                          </p>
                        )}
                      </div>

                      {/* Time and Author */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {formatTimeAgo(release.created_at)}
                          {release.commit_author && (
                            <span className="text-gray-500">
                              {" "}
                              by {release.commit_author}
                            </span>
                          )}
                        </span>

                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setLocation(
                                  `/${pkg.name}/releases/${release.package_release_id}`,
                                )
                              }}
                            >
                              View Release
                            </DropdownMenuItem>
                            {status !== "error" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setLocation(
                                    `/${pkg.name}/releases/${release.package_release_id}/preview`,
                                  )
                                }}
                              >
                                Preview Release
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setLocation(
                                  `/${pkg.name}/releases/${release.package_release_id}/builds`,
                                )
                              }}
                            >
                              View All Builds
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
