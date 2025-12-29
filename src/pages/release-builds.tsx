import { useParams } from "wouter"
import { Helmet } from "react-helmet-async"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuildsByReleaseId } from "@/hooks/use-package-builds"
import Header from "@/components/Header"
import { useLocation } from "wouter"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getBuildStatus,
  BuildItemRow,
  BuildItemRowSkeleton,
  formatBuildDuration,
} from "@/components/preview"

export default function ReleaseBuildsPage() {
  const params = useParams<{
    author: string
    packageName: string
    releaseId: string
  }>()

  const packageName =
    params?.author && params?.packageName
      ? `${params.author}/${params.packageName}`
      : null

  const [, setLocation] = useLocation()

  const {
    data: pkg,
    isLoading: isLoadingPackage,
    error: packageError,
  } = usePackageByName(packageName)

  const {
    data: packageRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
  } = usePackageReleaseByIdOrVersion(params?.releaseId ?? null, packageName)

  const {
    data: builds,
    isLoading: isLoadingBuilds,
    error: buildsError,
  } = usePackageBuildsByReleaseId(params?.releaseId ?? null)

  if (isLoadingPackage || isLoadingRelease || isLoadingBuilds) {
    return null
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
        <title>{`${pkg.name} Release ${packageRelease.version || `v${packageRelease.package_release_id.slice(-6)}`} Builds - tscircuit`}</title>
      </Helmet>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50 border-b py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PackageBreadcrumb
              author={params?.author || ""}
              packageName={packageName || ""}
              unscopedName={pkg.unscoped_name}
              currentPage="builds"
              releaseVersion={
                packageRelease.version ||
                `v${packageRelease.package_release_id.slice(-6)}`
              }
            />
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {pkg.name} - Release Builds
                </h1>
                <p className="text-gray-600 mt-2">
                  All builds for release {packageRelease.package_release_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Card>
              <CardHeader className="px-4 sm:px-6 pb-2 pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">
                    All Builds
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {builds?.length} build{builds?.length !== 1 ? "s" : ""}{" "}
                    found
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {isLoadingBuilds
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <BuildItemRowSkeleton key={i} />
                      ))
                    : builds?.map((build) => {
                        const { status, label } = getBuildStatus(build)
                        const buildDuration = formatBuildDuration(
                          build.user_code_started_at,
                          build.user_code_completed_at,
                        )

                        return (
                          <BuildItemRow
                            key={build.package_build_id}
                            id={build.package_build_id.slice(-8)}
                            subtitle={`Build #${build.package_build_id.slice(0, 8)}`}
                            status={status}
                            statusLabel={label}
                            duration={buildDuration}
                            createdAt={build.created_at}
                            // TODO: Create a build page to view that specific build log
                            // onClick={() => {
                            //   setLocation(
                            //     `/${pkg?.name}/build/${packageRelease.package_release_id}`,
                            //   )
                            // }}
                          />
                        )
                      })}
                  {!isLoadingBuilds && (!builds || builds.length === 0) && (
                    <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No builds found for this release.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
