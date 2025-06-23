import type { QueryClient } from "react-query"

/**
 * Populates React Query cache with SSR data to prevent unnecessary API calls
 * on initial page load. Should be called after QueryClient creation.
 */
export function populateQueryCacheWithSSRData(queryClient: QueryClient) {
  if (typeof window === "undefined") return

  const windowAny = window as any
  const ssrPackage = windowAny.SSR_PACKAGE
  const ssrPackageRelease = windowAny.SSR_PACKAGE_RELEASE
  const ssrPackageFiles = windowAny.SSR_PACKAGE_FILES

  if (!ssrPackage || !ssrPackageRelease) return

  // Cache lookups by package name and id
  queryClient.setQueryData(["package", ssrPackage.name], ssrPackage)
  queryClient.setQueryData(["package", ssrPackage.package_id], ssrPackage)
  queryClient.setQueryData(["packages", ssrPackage.package_id], ssrPackage)

  queryClient.setQueryData(
    [
      "packageRelease",
      {
        is_latest: true,
        package_name: ssrPackage.name,
        include_ai_review: true,
      },
    ],
    ssrPackageRelease,
  )

  queryClient.setQueryData(
    ["packageRelease", { is_latest: true, package_id: ssrPackage.package_id }],
    ssrPackageRelease,
  )

  queryClient.setQueryData(
    [
      "packageRelease",
      { package_release_id: ssrPackageRelease.package_release_id },
    ],
    ssrPackageRelease,
  )

  if (ssrPackageFiles && ssrPackageRelease.package_release_id) {
    queryClient.setQueryData(
      ["packageFiles", ssrPackageRelease.package_release_id],
      ssrPackageFiles,
    )
  }
}
