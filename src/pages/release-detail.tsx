import { useParams } from "wouter"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { useLatestPackageBuildByReleaseId } from "@/hooks/use-package-builds"
import { ConnectedRepoOverview } from "@/components/preview/ConnectedRepoOverview"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, GitBranch, Hash } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export default function ReleaseDetailPage() {
  const params = useParams<{
    author: string
    packageName: string
    releaseId: string
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

  const {
    data: packageRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
  } = usePackageReleaseById(params?.releaseId ?? null)

  const {
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = useLatestPackageBuildByReleaseId(params?.releaseId ?? null)

  if (isLoadingPackage || isLoadingRelease || isLoadingBuild) {
    return null
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (releaseError?.status === 404 || !packageRelease) {
    return <NotFoundPage heading="Release Not Found" />
  }

  if (buildError?.status === 404 || !latestBuild) {
    return <NotFoundPage heading="No Builds Found for Release" />
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-gray-50 border-b py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <PrefetchPageLink
                href={`/${pkg.name}`}
                className="hover:text-gray-900"
              >
                {pkg.name}
              </PrefetchPageLink>
              <span>/</span>
              <PrefetchPageLink
                href={`/${pkg.name}/releases`}
                className="hover:text-gray-900"
              >
                releases
              </PrefetchPageLink>
              <span>/</span>
              <span className="text-gray-900 font-medium">
                {packageRelease.version ||
                  `v${packageRelease.package_release_id.slice(-6)}`}
              </span>
            </div>

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <PrefetchPageLink href={`/${pkg.name}/releases`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Releases
                  </Button>
                </PrefetchPageLink>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {packageRelease.version ||
                      `Release v${packageRelease.package_release_id.slice(-6)}`}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span>{packageRelease.package_release_id.slice(-8)}</span>
                    </div>
                    {packageRelease.is_pr_preview && (
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-4 h-4" />
                        <Badge variant="outline" className="text-xs">
                          PR #{packageRelease.github_pr_number}
                        </Badge>
                      </div>
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
        </div>

        {/* Main Content */}
        <ConnectedRepoOverview
          build={latestBuild}
          pkg={pkg}
          packageRelease={packageRelease}
        />
      </div>
    </>
  )
}
