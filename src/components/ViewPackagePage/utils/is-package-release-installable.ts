import type { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"

/**
 * A package release is installable through the registry's npm proxy
 * (`tsci add`, `bun add`, `npm install`) when it has a published artifact:
 * either legacy transpiled output (`has_transpiled`) or a package build
 * (`latest_package_build_id`).
 *
 * A release with neither is advertised by the npm proxy with a `latest`
 * dist-tag pointing at an empty `versions` map, so package managers fail
 * with: Package "..." with tag "latest" not found, but package exists.
 */
export const isPackageReleaseInstallable = (
  packageRelease: Pick<
    PublicPackageRelease,
    "has_transpiled" | "latest_package_build_id"
  >,
): boolean => {
  return Boolean(
    packageRelease.has_transpiled || packageRelease.latest_package_build_id,
  )
}
