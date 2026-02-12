import { useParams, Link } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuild } from "@/hooks/use-package-builds"
import Header from "@/components/Header"
import { BuildDeploymentDetails } from "@/components/preview/BuildDeploymentDetails"
import { SingleBuildLogs } from "@/components/preview/SingleBuildLogs"
import { BuildCircuitErrors } from "@/components/preview/BuildCircuitErrors"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { useRebuildPackageReleaseMutation } from "@/hooks/use-rebuild-package-release-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useOrganization } from "@/hooks/use-organization"
import { useMemo, useState, useCallback, useEffect } from "react"
import { getBuildStatus } from "@/components/preview"
import { ArrowLeft } from "lucide-react"

export default function ReleaseBuildDetailPage() {
  const params = useParams<{
    author: string
    packageName: string
    releaseId: string
    buildId: string
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
    refetch: refetchRelease,
  } = usePackageReleaseByIdOrVersion(params?.releaseId ?? null, packageName, {
    include_logs: true,
  })

  const [isPollingAfterRebuild, setIsPollingAfterRebuild] = useState(false)
  const [buildIdWhenRebuildStarted, setBuildIdWhenRebuildStarted] = useState<
    string | null
  >(null)

  const {
    data: packageBuild,
    isLoading: isLoadingBuild,
    error: buildError,
    refetch: refetchBuild,
  } = usePackageBuild(params?.buildId ?? null, {
    include_logs: true,
  })

  const buildStatus = getBuildStatus(packageBuild)
  const isBuildActive =
    buildStatus.status === "building" || buildStatus.status === "queued"
  const shouldPoll = isPollingAfterRebuild || isBuildActive

  useEffect(() => {
    if (!shouldPoll) return

    const interval = setInterval(() => {
      refetchRelease()
      if (params?.buildId) {
        refetchBuild()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [shouldPoll, refetchRelease, refetchBuild, params?.buildId])

  useEffect(() => {
    if (!isPollingAfterRebuild) return
    if (!packageBuild) return
    if (
      buildIdWhenRebuildStarted &&
      params?.buildId === buildIdWhenRebuildStarted
    )
      return

    const status = getBuildStatus(packageBuild)
    if (status.status === "success" || status.status === "error") {
      setIsPollingAfterRebuild(false)
      setBuildIdWhenRebuildStarted(null)
    }
  }, [
    packageBuild,
    isPollingAfterRebuild,
    params?.buildId,
    buildIdWhenRebuildStarted,
  ])

  const session = useGlobalStore((s) => s.session)

  const handleRebuildSuccess = useCallback(() => {
    setBuildIdWhenRebuildStarted(params?.buildId ?? null)
    setIsPollingAfterRebuild(true)
    setTimeout(() => {
      refetchRelease()
      refetchBuild()
    }, 500)
  }, [refetchRelease, refetchBuild, params?.buildId])

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

  if (isLoadingPackage || isLoadingRelease || isLoadingBuild) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white">
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Skeleton className="h-48 rounded-lg" />
          </div>

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

  if (buildError?.status === 404 || (!isLoadingBuild && !packageBuild)) {
    return <NotFoundPage heading="Build Not Found" />
  }

  return (
    <>
      <Helmet>
        <title>{`Build ${params?.buildId?.slice(0, 8)} - ${pkg.name} - tscircuit`}</title>
      </Helmet>
      <Header />
      <div className="min-h-screen pb-10 md:pb-14 bg-white">
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
                releaseId={params?.releaseId}
                currentPage="builds"
                buildId={params?.buildId?.slice(0, 8)}
              />
            </div>
          </div>
        </div>

        {packageBuild && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <BuildDeploymentDetails
              pkg={pkg}
              packageRelease={packageRelease}
              packageBuild={packageBuild}
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
        )}

        <SingleBuildLogs
          packageBuild={packageBuild ?? null}
          isLoadingBuild={isLoadingBuild}
          isPollingAfterRebuild={isPollingAfterRebuild}
        />

        <BuildCircuitErrors
          packageReleaseId={packageRelease?.package_release_id ?? null}
          packageId={pkg?.package_id}
          isBuildActive={isBuildActive}
        />
      </div>
    </>
  )
}
