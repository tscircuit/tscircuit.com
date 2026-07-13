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
  const ssrPackageFile = windowAny.SSR_PACKAGE_FILE
  const ssrPackageFileArtifacts = windowAny.SSR_PACKAGE_FILE_ARTIFACTS
  const ssrPackageReleases = windowAny.SSR_PACKAGE_RELEASES
  const ssrPackageBuilds = windowAny.SSR_PACKAGE_BUILDS
  const ssrPackageBuild = windowAny.SSR_PACKAGE_BUILD
  const ssrPackageRoute = windowAny.SSR_PACKAGE_ROUTE

  if (!ssrPackage) return

  // Cache lookups by package name and id
  queryClient.setQueryData(["package", ssrPackage.name], ssrPackage)
  queryClient.setQueryData(["package", ssrPackage.package_id], ssrPackage)
  queryClient.setQueryData(["packages", ssrPackage.package_id], ssrPackage)

  if (ssrPackageReleases) {
    queryClient.setQueryData(
      ["packageReleases", ssrPackage.package_id],
      ssrPackageReleases,
    )
  }

  if (ssrPackageRelease) {
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
      [
        "packageRelease",
        { is_latest: true, package_id: ssrPackage.package_id },
      ],
      ssrPackageRelease,
    )

    queryClient.setQueryData(
      [
        "packageRelease",
        { package_release_id: ssrPackageRelease.package_release_id },
      ],
      ssrPackageRelease,
    )

    queryClient.setQueryData(
      [
        "packageRelease",
        {
          package_release_id: ssrPackageRelease.package_release_id,
          include_logs: true,
        },
      ],
      ssrPackageRelease,
    )

    if (ssrPackageRoute?.releaseId) {
      queryClient.setQueryData(
        [
          "packageRelease",
          {
            package_name_with_version: `${ssrPackage.name}@${ssrPackageRoute.releaseId}`,
            include_logs: true,
          },
        ],
        ssrPackageRelease,
      )
      queryClient.setQueryData(
        [
          "packageRelease",
          {
            package_name_with_version: `${ssrPackage.name}@${ssrPackageRoute.releaseId}`,
          },
        ],
        ssrPackageRelease,
      )
    }

    if (ssrPackageRoute?.version) {
      queryClient.setQueryData(
        [
          "packageRelease",
          {
            package_name_with_version: `${ssrPackage.name}@${ssrPackageRoute.version}`,
            include_ai_review: true,
          },
        ],
        ssrPackageRelease,
      )
    }
  }

  if (ssrPackageFiles && ssrPackageRelease?.package_release_id) {
    queryClient.setQueryData(
      ["packageFiles", ssrPackageRelease.package_release_id],
      ssrPackageFiles,
    )
  }

  if (
    ssrPackageFile &&
    ssrPackageRelease?.package_release_id &&
    ssrPackageRoute?.filePath
  ) {
    queryClient.setQueryData(
      [
        "packageFile",
        {
          package_release_id: ssrPackageRelease.package_release_id,
          file_path: ssrPackageRoute.filePath,
        },
      ],
      ssrPackageFile,
    )
  }

  if (ssrPackageFileArtifacts && ssrPackageRelease?.package_release_id) {
    for (const artifact of ssrPackageFileArtifacts) {
      if (!artifact?.file_path) continue
      queryClient.setQueryData(
        [
          "packageFile",
          {
            package_release_id: ssrPackageRelease.package_release_id,
            file_path: String(artifact.file_path).replace(/^\/+/, ""),
          },
        ],
        artifact,
      )
    }
  }

  if (ssrPackageBuilds && ssrPackageRoute?.releaseId) {
    queryClient.setQueryData(
      ["packageBuilds", { package_release_id: ssrPackageRoute.releaseId }],
      ssrPackageBuilds,
    )
    if (ssrPackageRelease?.package_release_id !== ssrPackageRoute.releaseId) {
      queryClient.setQueryData(
        [
          "packageBuilds",
          { package_release_id: ssrPackageRelease?.package_release_id },
        ],
        ssrPackageBuilds,
      )
    }
  }

  if (ssrPackageBuild?.package_build_id) {
    queryClient.setQueryData(
      ["packageBuild", ssrPackageBuild.package_build_id, true],
      ssrPackageBuild,
    )
  }
}
