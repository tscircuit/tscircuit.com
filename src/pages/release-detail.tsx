import { useParams } from "wouter"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { ConnectedRepoOverview } from "@/components/preview/ConnectedRepoOverview"
import Header from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Calendar, GitBranch } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { usePackageReleaseImages } from "@/hooks/use-package-release-images"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReleaseDetailPage() {
  const params = useParams<{
    author: string
    packageName: string
    releaseId?: string
    packageReleaseId?: string
  }>()

  const packageName =
    params?.author && params?.packageName
      ? `${params.author}/${params.packageName}`
      : null

  const {
    data: pkg,
    isLoading: isLoadingPackage,
    error: packageError,
  } = usePackageByName(packageName)

  const releaseIdOrVersion =
    params?.releaseId ?? params?.packageReleaseId ?? null

  const {
    data: packageRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
  } = usePackageReleaseByIdOrVersion(releaseIdOrVersion, packageName, {
    include_logs: true,
  })

  const {
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = usePackageBuild(packageRelease?.latest_package_build_id ?? null, {
    include_logs: true,
  })

  const { availableViews } = usePackageReleaseImages({
    packageReleaseId: packageRelease?.package_release_id,
  })

  if (isLoadingPackage || isLoadingRelease) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          {/* Page Header Skeleton */}
          <div className="bg-gray-50 border-b py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Skeleton className="h-6 w-64 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Images Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (releaseError?.status === 404 || !packageRelease) {
    return <NotFoundPage heading="Release Not Found" />
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-gray-50 border-b py-6">
          <div className="max-w-7xl lg:flex lg:justify-between mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <PackageBreadcrumb
              author={pkg.owner_github_username || ""}
              packageName={pkg.name}
              unscopedName={pkg.unscoped_name}
              releaseVersion={
                packageRelease.version ||
                `v${packageRelease.package_release_id.slice(-6)}`
              }
            />

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {packageRelease.is_pr_preview && (
                    <a
                      href={`https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease.github_pr_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <Badge variant="outline" className="text-xs">
                          PR #{packageRelease.github_pr_number}
                        </Badge>
                      </div>
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Created {formatTimeAgo(packageRelease.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images Section - Always show with skeletons while loading */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableViews.length > 0
              ? availableViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-center border rounded-lg bg-gray-50 overflow-hidden h-48"
                  >
                    {view.isLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <img
                        src={view.imageUrl}
                        alt={`${view.label} preview`}
                        className={`w-full h-full object-contain ${view.label.toLowerCase() == "pcb" ? "bg-black" : view.label.toLowerCase() == "schematic" ? "bg-[#F5F1ED]" : "bg-gray-100"}`}
                      />
                    )}
                  </div>
                ))
              : [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
          </div>
        </div>

        {/* Main Content */}
        <ConnectedRepoOverview
          packageBuild={latestBuild ?? null}
          isLoadingBuild={isLoadingBuild}
          pkg={pkg}
          packageRelease={packageRelease}
        />
      </div>
    </>
  )
}
