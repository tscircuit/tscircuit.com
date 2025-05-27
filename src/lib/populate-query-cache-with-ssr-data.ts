import type { QueryClient } from "react-query"

/**
 * Populates React Query cache with SSR data to prevent unnecessary API calls
 * on initial page load. Should be called after QueryClient creation.
 */
export function populateQueryCacheWithSSRData(queryClient: QueryClient) {
  if (typeof window === "undefined") return

  const ssrPackage = (window as any).SSR_PACKAGE
  const ssrPackageRelease = (window as any).SSR_PACKAGE_RELEASE
  const ssrPackageFiles = (window as any).SSR_PACKAGE_FILES

  if (ssrPackage) {
    // Cache package data with all possible query keys
    queryClient.setQueryData(["package", ssrPackage.package_id], ssrPackage)
    queryClient.setQueryData(["package", ssrPackage.name], ssrPackage)
    queryClient.setQueryData(["packages", ssrPackage.package_id], ssrPackage)
  }

  if (ssrPackageRelease && ssrPackage) {
    // Cache package release with various query patterns
    queryClient.setQueryData(
      [
        "packageRelease",
        { package_id: ssrPackage.package_id, is_latest: true },
      ],
      ssrPackageRelease,
    )
    queryClient.setQueryData(
      ["packageRelease", { package_name: ssrPackage.name, is_latest: true }],
      ssrPackageRelease,
    )
    if (ssrPackageRelease.package_release_id) {
      queryClient.setQueryData(
        [
          "packageRelease",
          { package_release_id: ssrPackageRelease.package_release_id },
        ],
        ssrPackageRelease,
      )
    }

    // Cache package files if available
    if (ssrPackageFiles && ssrPackageRelease.package_release_id) {
      queryClient.setQueryData(
        ["packageFiles", ssrPackageRelease.package_release_id],
        ssrPackageFiles,
      )
    }
  }
}
