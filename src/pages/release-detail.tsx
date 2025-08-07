import { useParams } from "wouter"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { ConnectedRepoOverview } from "@/components/preview/ConnectedRepoOverview"
import Header from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, GitBranch, Hash, Copy, Check } from "lucide-react"
import { useState } from "react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"

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

  const [copied, setCopied] = useState(false)

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
  } = usePackageReleaseByIdOrVersion(releaseIdOrVersion, packageName)

  const {
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = usePackageBuild(packageRelease?.latest_package_build_id ?? null)

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
