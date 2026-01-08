import { useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { ConnectedRepoOverview } from "@/components/preview/ConnectedRepoOverview"
import Header from "@/components/Header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GitBranch, RefreshCw, Share2, ExternalLink } from "lucide-react"
import { BuildDetailsCard } from "@/components/BuildDetailsCard"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { usePackageReleaseDbImages } from "@/hooks/use-package-release-db-images"
import { Skeleton } from "@/components/ui/skeleton"
import { useRebuildPackageReleaseMutation } from "@/hooks/use-rebuild-package-release-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { getBuildStatus } from "@/components/preview"
import { useOrganization } from "@/hooks/use-organization"
import { useMemo } from "react"

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

  const { availableViews } = usePackageReleaseDbImages({
    packageRelease,
  })

  const session = useGlobalStore((s) => s.session)
  const { mutate: rebuildPackage, isLoading: isRebuildLoading } =
    useRebuildPackageReleaseMutation()
  const { status } = getBuildStatus(latestBuild ?? null)

  const { organization } = useOrganization(
    pkg?.owner_org_id
      ? { orgId: String(pkg.owner_org_id) }
      : pkg?.org_owner_tscircuit_handle
        ? { orgTscircuitHandle: pkg.org_owner_tscircuit_handle }
        : {},
  )

  const canManagePackage = useMemo(() => {
    if (!pkg) return true
    if (!session) return false
    if (organization?.owner_account_id === session?.account_id) return true
    if (organization?.user_permissions?.can_manage_org) return true
    if (pkg?.creator_account_id === session?.account_id) return true
    return false
  }, [session, pkg, organization, session?.account_id, pkg?.creator_account_id])

  if (isLoadingPackage || isLoadingRelease) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
          {/* Page Header Skeleton */}
          <div className="bg-gray-50 border-b py-6">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <Skeleton className="h-6 w-64 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Build Details Card Skeleton */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-48 rounded-lg" />
          </div>

          {/* Main Content Skeleton */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      <Helmet>
        <title>{`${pkg.name} Release ${packageRelease.version || `v${packageRelease.package_release_id.slice(-6)}`} - tscircuit`}</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <div className="bg-gray-50 border-b py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb and Rebuild Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PackageBreadcrumb
                  author={
                    pkg.org_owner_tscircuit_handle || pkg.name.split("/")[0]
                  }
                  packageName={pkg.name}
                  unscopedName={pkg.unscoped_name}
                  releaseVersion={
                    packageRelease.version ||
                    `v${packageRelease.package_release_id.slice(-6)}`
                  }
                />
                {packageRelease.is_pr_preview && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease.github_pr_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <GitBranch className="w-4 h-4" />
                          <Badge variant="outline" className="text-xs">
                            PR #{packageRelease.github_pr_number}
                          </Badge>
                        </a>
                      </TooltipTrigger>
                      {packageRelease.github_pr_title && (
                        <TooltipContent>
                          {packageRelease.github_pr_title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Rebuild Button */}
              {canManagePackage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 bg-white hover:bg-gray-50 flex-shrink-0"
                  disabled={isRebuildLoading || !packageRelease}
                  onClick={() =>
                    packageRelease &&
                    rebuildPackage({
                      package_release_id: packageRelease.package_release_id,
                    })
                  }
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${isRebuildLoading ? "animate-spin" : ""}`}
                  />
                  {isRebuildLoading ? "Rebuilding..." : "Rebuild"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Build Details Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Build Details
            </h2>
            {status !== "error" &&
              latestBuild &&
              packageRelease.package_release_website_url && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (packageRelease.package_release_website_url) {
                        window.open(
                          packageRelease.package_release_website_url,
                          "_blank",
                        )
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit
                  </Button>
                </div>
              )}
          </div>

          {/* Build Details Card */}
          <BuildDetailsCard
            pkg={pkg}
            packageRelease={packageRelease}
            latestBuild={latestBuild ?? null}
            status={status}
            availableViews={availableViews}
          />
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
