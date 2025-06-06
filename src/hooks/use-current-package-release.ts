import { useParams } from "wouter"
import { useCurrentPackageId } from "./use-current-package-id"
import { useUrlParams } from "./use-url-params"
import { usePackageRelease } from "./use-package-release"

export const useCurrentPackageRelease = (options?: {
  include_logs: boolean
}) => {
  const { packageId } = useCurrentPackageId()
  const urlParams = useUrlParams()
  const { author, packageName } = useParams()

  const version = urlParams.version
  const releaseId = urlParams.package_release_id

  let query: Parameters<typeof usePackageRelease>[0] | null = null

  if (releaseId) {
    query = { package_release_id: releaseId }
  } else if (version && author && packageName) {
    query = { package_name_with_version: `${author}/${packageName}@${version}` }
  } else if (author && packageName) {
    query = { package_name: `${author}/${packageName}`, is_latest: true }
  } else if (packageId) {
    query = { package_id: packageId, is_latest: true }
  }

  const { data: packageRelease, ...rest } = usePackageRelease(query, {
    include_logs: options?.include_logs ?? false,
  })
  return { packageRelease, ...rest }
}
