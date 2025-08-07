import { useParams } from "wouter"
import NotFoundPage from "./404"
import { useLatestPackageRelease } from "@/hooks/use-package-release"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { usePackageByName } from "@/hooks/use-package-by-package-name"
import { PackageReleasesDashboard } from "@/components/preview/PackageReleasesDashboard"

export default function ReleasesPage() {
  const params = useParams<{ author: string; packageName: string }>()
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
    data: latestRelease,
    isLoading: isLoadingRelease,
    error: releaseError,
  } = useLatestPackageRelease(pkg?.package_id ?? null)

  // Get the latest build for the latest release to show status and metadata
  const {
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = usePackageBuild(latestRelease?.latest_package_build_id ?? null)

  if (isLoadingPackage || isLoadingRelease || isLoadingBuild) {
    return null
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (releaseError?.status === 404 || !latestRelease) {
    return <NotFoundPage heading="No Releases Found" />
  }

  // If there's no build, we still want to show the releases page
  // The PackageReleasesDashboard will handle the case where latestBuild is null
  return <PackageReleasesDashboard latestBuild={latestBuild ?? null} pkg={pkg} />
}
