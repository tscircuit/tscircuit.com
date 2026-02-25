import { useParams, Link } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuild } from "@/hooks/use-package-builds"
import Header from "@/components/Header"
import { ReleaseDeploymentDetails } from "@/components/preview/ReleaseDeploymentDetails"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useRebuildPackageReleaseMutation } from "@/hooks/use-rebuild-package-release-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useOrganization } from "@/hooks/use-organization"
import { useMemo, useState, useCallback, useEffect } from "react"
import { ReleaseBuildLogs } from "@/components/preview/ReleaseBuildLogs"
import { getBuildStatus } from "@/components/preview"
import { ScrollToTopButton } from "@/components/ScrollToTopButton"

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

  const [isPollingAfterRebuild, setIsPollingAfterRebuild] = useState(false)
  const [buildIdWhenRebuildStarted, setBuildIdWhenRebuildStarted] = useState<
    string | null
  >(null)

  const {
    data: packageRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
    refetch: refetchRelease,
  } = usePackageReleaseByIdOrVersion(releaseIdOrVersion, packageName, {
    include_logs: true,
  })

  const currentBuildId = packageRelease?.latest_package_build_id ?? null

  const {
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
    refetch: refetchBuild,
  } = usePackageBuild(currentBuildId, {
    include_logs: true,
  })

  const buildStatus = getBuildStatus(latestBuild)
  const isBuildActive =
    buildStatus.status === "building" || buildStatus.status === "queued"
  const shouldPoll = isPollingAfterRebuild || isBuildActive

  useEffect(() => {
    if (!shouldPoll) return

    const interval = setInterval(() => {
      refetchRelease()
      if (currentBuildId) {
        refetchBuild()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shouldPoll, refetchRelease, refetchBuild, currentBuildId])

  useEffect(() => {
    if (!isPollingAfterRebuild) return
    if (!latestBuild) return
    if (
      buildIdWhenRebuildStarted &&
      currentBuildId === buildIdWhenRebuildStarted
    )
      return

    const status = getBuildStatus(latestBuild)
    if (status.status === "success" || status.status === "error") {
      setIsPollingAfterRebuild(false)
      setBuildIdWhenRebuildStarted(null)
    }
  }, [
    latestBuild,
    isPollingAfterRebuild,
    currentBuildId,
    buildIdWhenRebuildStarted,
  ])

  const session = useGlobalStore((s) => s.session)

  const handleRebuildSuccess = useCallback(() => {
    setBuildIdWhenRebuildStarted(currentBuildId)
    setIsPollingAfterRebuild(true)
    setTimeout(() => {
      refetchRelease()
    }, 500)
  }, [refetchRelease, currentBuildId])

  const { mutate: rebuildPackage, isLoading: isRebuildLoading } =
    useRebuildPackageReleaseMutation({
      onSuccess: handleRebuildSuccess,
    })

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
          <div className="bg-white border-b py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <span className="text-gray-300">/</span>
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
          </div>

          {/* Build Details Card Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-48 rounded-lg" />
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
      <Helmet>
        <title>{`${pkg.name} Release ${packageRelease.version || `v${packageRelease.package_release_id.slice(-6)}`} - tscircuit`}</title>
      </Helmet>
      <Header />
      <div className="min-h-screen pb-10 md:pb-14 bg-white">
        {/* Page Header */}
        <div className="bg-white pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
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
            </div>
          </div>
        </div>

        {/* Release Details Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-center justify-between mb-4"></div>

          {/* Release Details */}
          <ReleaseDeploymentDetails
            pkg={pkg}
            packageRelease={packageRelease}
            latestBuild={latestBuild ?? null}
            canManagePackage={canManagePackage}
            isRebuildLoading={isRebuildLoading}
            isPollingAfterRebuild={isPollingAfterRebuild}
            onRebuild={() =>
              packageRelease &&
              rebuildPackage({
                package_release_id: packageRelease.package_release_id,
              })
            }
            organization={organization}
          />
        </div>

        {/* Build Logs */}
        <ReleaseBuildLogs
          packageBuild={latestBuild ?? null}
          isLoadingBuild={isLoadingBuild}
          packageRelease={packageRelease}
          canManagePackage={canManagePackage}
          isPollingAfterRebuild={isPollingAfterRebuild}
        />

        {/* Link to all builds */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <Link
            to={`/${params?.author}/${params?.packageName}/releases/${packageRelease.package_release_id}/builds`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            View all builds for this release &rarr;
          </Link>
        </div>
      </div>
      <ScrollToTopButton />
    </>
  )
}
