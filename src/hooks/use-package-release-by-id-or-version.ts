import {
  usePackageReleaseById,
  usePackageReleaseByNameAndVersion,
} from "./use-package-release"
import { isUuid } from "@/lib/utils/isUuid"

export const usePackageReleaseByIdOrVersion = (
  releaseIdOrVersion: string | null,
  packageName?: string | null,
) => {
  const isReleaseIdUuid = releaseIdOrVersion
    ? isUuid(releaseIdOrVersion)
    : false

  // If it's a UUID, use the ID-based hook
  const releaseByIdQuery = usePackageReleaseById(
    isReleaseIdUuid ? releaseIdOrVersion : null,
  )

  // If it's not a UUID and we have a package name, construct the version-based query
  const packageNameWithVersion =
    !isReleaseIdUuid && packageName && releaseIdOrVersion
      ? `${packageName}@${releaseIdOrVersion}`
      : null

  const releaseByVersionQuery = usePackageReleaseByNameAndVersion(
    packageNameWithVersion,
  )

  // Return the appropriate query result
  if (isReleaseIdUuid) {
    return releaseByIdQuery
  } else {
    return releaseByVersionQuery
  }
}
