import { useParams } from "wouter"
import NotFoundPage from "./404"
import { useLatestPackageBuildByPackageId } from "@/hooks/use-package-builds"
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
    data: latestBuild,
    isLoading: isLoadingBuild,
    error: buildError,
  } = useLatestPackageBuildByPackageId(pkg?.package_id ?? null)

  if (isLoadingPackage || isLoadingBuild) {
    return null
  }

  if (packageError?.status === 404 || !pkg) {
    return <NotFoundPage heading="Package Not Found" />
  }

  if (buildError?.status === 404 || !latestBuild) {
    return <NotFoundPage heading="No Builds Found" />
  }

  return <PackageReleasesDashboard latestBuild={latestBuild} pkg={pkg} />
}
