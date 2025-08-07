import { useParams } from "wouter"
import NotFoundPage from "./404"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { usePackageReleaseByIdOrVersion } from "@/hooks/use-package-release-by-id-or-version"
import { usePackageBuildsByReleaseId } from "@/hooks/use-package-builds"
import { BuildsList } from "@/components/preview/BuildsList"
import Header from "@/components/Header"
import { useLocation } from "wouter"
import { PackageBreadcrumb } from "@/components/PackageBreadcrumb"
import { PackageBuild } from "fake-snippets-api/lib/db/schema"

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

  const handleSelectBuild = (build: PackageBuild) => {
    setLocation(`/build/${build.package_build_id}`)
  }

  if (isLoadingPackage || isLoadingRelease || isLoadingBuilds) {
    return null
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (releaseError?.status === 404 || !packageRelease) {
    return <NotFoundPage heading="Release Not Found" />
  }

  if (buildsError?.status === 404 || !builds?.length) {
    return <NotFoundPage heading="No Builds Found for Release" />
  }

  return (
    <>
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Builds</h2>
              <p className="text-sm text-gray-600">
                {builds?.length} build{builds?.length !== 1 ? "s" : ""} found
              </p>
            </div>
            {pkg && <BuildsList pkg={pkg} />}
          </div>
        </div>
      </div>
    </>
  )
}
