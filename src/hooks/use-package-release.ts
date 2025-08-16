import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { type UseQueryOptions, useQuery } from "react-query"
import { useAxios } from "./use-axios"

type PackageReleaseQuery = (
  | {
      package_release_id: string
    }
  | {
      package_name_with_version: string
    }
  | {
      package_name: string
      is_latest: boolean
    }
  | {
      package_id: string
      is_latest: boolean
    }
) & {
  include_logs?: boolean | null | undefined
  include_ai_review?: boolean | null | undefined
}

export const usePackageRelease = (
  query: PackageReleaseQuery | null,
  options?: {
    refetchInterval?:
      | number
      | false
      | ((data: PackageRelease | undefined) => number | false)
  },
) => {
  const axios = useAxios()

  // Normalize the query to avoid cache misses due to undefined vs explicit values
  const normalizedQuery = query
    ? {
        ...query,
        include_logs: query.include_logs ?? false,
        include_ai_review: query.include_ai_review ?? false,
      }
    : null

  return useQuery<PackageRelease, Error & { status: number }>(
    ["packageRelease", normalizedQuery],
    async () => {
      if (!normalizedQuery) return

      const { data } = await axios.post(
        "/package_releases/get",
        normalizedQuery,
        {
          params: {
            include_logs: normalizedQuery.include_logs,
            include_ai_review: normalizedQuery.include_ai_review,
          },
        },
      )

      if (!data.package_release) {
        throw new Error("Package release not found")
      }

      return data.package_release
    },
    {
      retry: false,
      enabled: Boolean(normalizedQuery),
      refetchInterval: options?.refetchInterval,
      refetchOnWindowFocus: false,
    },
  )
}

// Convenience hooks for common use cases
export const usePackageReleaseById = (packageReleaseId?: string | null) => {
  return usePackageRelease(
    packageReleaseId ? { package_release_id: packageReleaseId } : null,
  )
}

export const usePackageReleaseByNameAndVersion = (
  packageNameWithVersion: string | null,
) => {
  return usePackageRelease(
    packageNameWithVersion
      ? { package_name_with_version: packageNameWithVersion }
      : null,
  )
}

export const useLatestPackageRelease = (
  packageId?: string | null,
  packageName?: string | null,
) => {
  // Prioritize packageName if both are provided
  const query = packageName
    ? { package_name: packageName, is_latest: true }
    : packageId
      ? { package_id: packageId, is_latest: true }
      : null

  return usePackageRelease(query)
}

export const usePackageReleasesByPackageId = (packageId: string | null) => {
  const axios = useAxios()

  return useQuery<PackageRelease[], Error & { status: number }>(
    ["packageReleases", packageId],
    async () => {
      if (!packageId) {
        throw new Error("package_id is required")
      }

      const { data } = await axios.post<{ package_releases: PackageRelease[] }>(
        "/package_releases/list",
        {
          package_id: packageId,
        },
      )

      if (!data.package_releases) {
        return []
      }

      return data.package_releases
    },
    {
      enabled: Boolean(packageId),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  )
}
