import { useParams } from "wouter"
import NotFoundPage from "./404"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { usePackageById } from "@/hooks/use-package-by-package-id"
import { PackageReleasesDashboard } from "@/components/preview/PackageReleasesDashboard"

export default function ViewConnectedRepoOverview() {
  const params = useParams<{ buildId: string }>()
  const {
    data: packageBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = usePackageBuild(params?.buildId)
  const {
    data: packageRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
  } = usePackageReleaseById(packageBuild?.package_release_id)
  const {
    data: buildPackage,
    isLoading: isLoadingPackage,
    error: packageError,
  } = usePackageById(String(packageRelease?.package_id))

  if (isLoadingBuild || isLoadingRelease || isLoadingPackage) {
    return null
  }

  if (buildError?.status === 404 || !packageBuild) {
    return <NotFoundPage heading="Build Not Found" />
  }

  if (releaseError?.status === 404 || !packageRelease) {
    return <NotFoundPage heading="Package Release Not Found" />
  }

  if (packageError?.status === 404 || !buildPackage) {
    return <NotFoundPage heading="Package Not Found" />
  }

  return (
    <PackageReleasesDashboard latestBuild={packageBuild} pkg={buildPackage} />
  )
}
