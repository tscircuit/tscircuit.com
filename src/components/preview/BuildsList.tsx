import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, GitCommitHorizontal } from "lucide-react"
import {
  getBuildStatus,
  PackageReleaseOrBuildItemRow,
  PackageReleaseOrBuildItemRowSkeleton,
  formatBuildDuration,
} from "."
import {
  Package,
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"

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

  const renderGitInfo = (release: PublicPackageRelease) => {
    if (!pkg?.github_repo_full_name) {
      return <p className="text-sm text-gray-400">No repository linked</p>
    }

    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-gray-900">
          <GitBranch className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-mono truncate">
            {release.github_branch_name ||
              (release.is_pr_preview
                ? `pr-${release.github_pr_number}`
                : "main")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-900">
          <GitCommitHorizontal className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate block">
            <span className="font-mono">
              {release.package_release_id.slice(0, 7)}
            </span>
            {/* {release.commit_message && (
              <span className="ml-1.5 text-gray-600 truncate">
                {release.commit_message.slice(0, 40)}
                {release.commit_message.length > 40 ? "..." : ""}
              </span>
            )} */}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="px-4 sm:px-6 pb-2 pt-4 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            Recent Releases
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <PackageReleaseOrBuildItemRowSkeleton key={i} />
                ))
              : releases?.map((release) => {
                  const latestBuild = latestBuildsMap.get(
                    release.package_release_id,
                  )
                  const { status, label } = getBuildStatus(latestBuild)
                  const buildDuration = formatBuildDuration(
                    latestBuild?.user_code_job_started_at,
                    latestBuild?.user_code_job_completed_at,
                  )

                  return (
                    <PackageReleaseOrBuildItemRow
                      key={release.package_release_id}
                      package_release_or_build_id={
                        release.version || release.package_release_id
                      }
                      status={status}
                      statusLabel={label}
                      duration={buildDuration}
                      createdAt={release.created_at}
                      isLatest={release.is_latest}
                      onClick={() => {
                        setLocation(
                          `/${pkg.name}/releases/${release.package_release_id}`,
                        )
                      }}
                      middleContent={renderGitInfo(release)}
                      dropdownActions={[
                        {
                          label: "View Release",
                          onClick: () =>
                            setLocation(
                              `/${pkg.name}/releases/${release.package_release_id}`,
                            ),
                        },
                        {
                          label: "Preview Release",
                          onClick: () =>
                            setLocation(
                              `/${pkg.name}/releases/${release.package_release_id}/preview`,
                            ),
                          hidden: status === "error",
                        },
                        {
                          label: "View All Builds",
                          onClick: () =>
                            setLocation(
                              `/${pkg.name}/releases/${release.package_release_id}/builds`,
                            ),
                        },
                      ]}
                    />
                  )
                })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
