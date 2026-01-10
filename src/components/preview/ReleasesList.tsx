import {
  Package,
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import { getBuildStatus, getBuildErrorMessage } from "."
import { ReleaseItemRow, ReleaseItemRowSkeleton } from "./ReleaseItemRow"

export const ReleasesList = ({
  pkg,
  releases,
  isLoading,
  searchQuery = "",
  statusFilter = "all-Status",
  releaseTypeFilter = "all-types",
}: {
  pkg: Package
  releases?: PublicPackageRelease[]
  isLoading?: boolean
  searchQuery?: string
  statusFilter?: string
  releaseTypeFilter?: string
}) => {
  const axios = useAxios()
  const [, setLocation] = useLocation()

  const filteredReleases = releases?.filter((release) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      release.version?.toLowerCase().includes(searchLower) ||
      release.package_release_id.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    if (releaseTypeFilter !== "all-types") {
      if (releaseTypeFilter === "pr-preview") {
        if (!release.is_pr_preview) return false
      } else if (releaseTypeFilter === "release") {
        if (release.is_pr_preview) return false
      }
    }

    if (statusFilter === "all-Status") return true

    const { status } = getBuildStatus(release)

    return status === statusFilter
  })

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReleaseItemRowSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-100">
        {filteredReleases?.map((release) => {
          const { status, label } = getBuildStatus(release)
          const errorMessage = getBuildErrorMessage(release)

          return (
            <ReleaseItemRow
              key={release.package_release_id}
              release={release}
              status={status}
              statusLabel={label}
              isLatest={release.is_latest}
              errorMessage={errorMessage}
              onClick={() => {
                setLocation(
                  `/${pkg.name}/releases/${release.package_release_id}`,
                )
              }}
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
                  hidden: status !== "success",
                },
                {
                  label: "View All Builds",
                  onClick: () =>
                    setLocation(
                      `/${pkg.name}/releases/${release.package_release_id}/builds`,
                    ),
                },
                {
                  label: "View Source",
                  onClick: () => {
                    if (
                      pkg.github_repo_full_name &&
                      release.github_commit_sha
                    ) {
                      window.open(
                        `https://github.com/${pkg.github_repo_full_name}/tree/${release.github_commit_sha}`,
                        "_blank",
                      )
                    }
                  },
                  hidden:
                    !pkg.github_repo_full_name || !release.github_commit_sha,
                },
              ]}
            />
          )
        })}
        {(!filteredReleases || filteredReleases.length === 0) && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">
              {releases?.length === 0
                ? "No releases found."
                : "No releases match your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
