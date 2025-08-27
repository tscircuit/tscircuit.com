import { usePackageRelease } from "./use-package-release"
import { isUuid } from "@/lib/utils/isUuid"

export const usePackageReleaseByIdOrVersion = (
  releaseIdOrVersion: string | null,
  packageName?: string | null,
  options?: {
    include_logs?: boolean
    include_ai_review?: boolean
    refetchInterval?:
      | number
      | false
      | ((
          data:
            | import("fake-snippets-api/lib/db/schema").PackageRelease
            | undefined,
        ) => number | false)
  },
) => {
  const isReleaseIdUuid = releaseIdOrVersion
    ? isUuid(releaseIdOrVersion)
    : false

  let query: Parameters<typeof usePackageRelease>[0] = null

  if (isReleaseIdUuid) {
    query = releaseIdOrVersion
      ? { package_release_id: releaseIdOrVersion }
      : null
  } else if (packageName && releaseIdOrVersion) {
    query = {
      package_name_with_version: `${packageName}@${releaseIdOrVersion}`,
    }
  }

  if (query && options?.include_logs !== undefined) {
    query.include_logs = options.include_logs
  }

  if (query && options?.include_ai_review !== undefined) {
    query.include_ai_review = options.include_ai_review
  }

  return usePackageRelease(query, { refetchInterval: options?.refetchInterval })
}
