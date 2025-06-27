import { useParams } from "wouter"
import { useCurrentPackageId } from "./use-current-package-id"
import { usePackageRelease } from "./use-package-release"
import { useUrlParams } from "./use-url-params"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"

export const useCurrentPackageRelease = (options?: {
  include_ai_review?: boolean
  include_logs?: boolean
  refetchInterval?:
    | number
    | false
    | ((data: PackageRelease | undefined) => number | false)
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

  if (query && options?.include_logs !== undefined) {
    query.include_logs = options.include_logs
  }

  if (query && options?.include_ai_review !== undefined) {
    query.include_ai_review = options.include_ai_review
  }

  const { data: packageRelease, ...rest } = usePackageRelease(query, {
    refetchInterval: options?.refetchInterval,
  })

  return { packageRelease, ...rest }
}
