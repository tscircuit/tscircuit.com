import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
): ZT.PackageRelease => {
  return {
    ...internal_package_release,
    created_at: internal_package_release.created_at,
  }
}
