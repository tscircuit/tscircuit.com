import type { QueryClient } from "react-query"

/**
 * Populates React Query cache with SSR data to prevent unnecessary API calls
 * on initial page load. Should be called after QueryClient creation.
 */
export function populateQueryCacheWithSSRData(queryClient: QueryClient) {
  if (typeof window !== "undefined" && (window as any).SSR_PACKAGE) {
    const { package: ssrPackage, packageRelease: ssrPackageRelease } = (window as any).SSR_PACKAGE
    
    if (ssrPackage) {
      // Cache package data with all possible query keys
      queryClient.setQueryData(["package", ssrPackage.package_id], ssrPackage)
      queryClient.setQueryData(["package", ssrPackage.name], ssrPackage)
      queryClient.setQueryData(["packages", ssrPackage.package_id], ssrPackage)
      
      // Cache package stars data (assuming basic star info)
      queryClient.setQueryData(
        ["packageStars", { package_id: ssrPackage.package_id }],
        { is_starred: ssrPackage.is_starred ?? false, star_count: ssrPackage.star_count ?? 0 }
      )
      queryClient.setQueryData(
        ["packageStars", { name: ssrPackage.name }],
        { is_starred: ssrPackage.is_starred ?? false, star_count: ssrPackage.star_count ?? 0 }
      )
    }
    
    if (ssrPackageRelease && ssrPackage) {
      // Cache package release with various query patterns
      queryClient.setQueryData(
        ["packageRelease", { package_id: ssrPackage.package_id, is_latest: true }],
        ssrPackageRelease
      )
      queryClient.setQueryData(
        ["packageRelease", { package_name: ssrPackage.name, is_latest: true }],
        ssrPackageRelease
      )
      if (ssrPackageRelease.package_release_id) {
        queryClient.setQueryData(
          ["packageRelease", { package_release_id: ssrPackageRelease.package_release_id }],
          ssrPackageRelease
        )
      }
      
      // Cache empty package files list (will be populated by actual API call if needed)
      if (ssrPackageRelease.package_release_id) {
        queryClient.setQueryData(["packageFiles", ssrPackageRelease.package_release_id], [])
      }
    }
  }
}