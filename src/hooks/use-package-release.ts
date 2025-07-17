import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { type UseQueryOptions, useQuery } from "react-query"
import { useAxios } from "./useAxios"

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

  return useQuery<PackageRelease, Error & { status: number }>(
    ["packageRelease", query],
    async () => {
      if (!query) return

      const { data } = await axios.post("/package_releases/get", query, {
        params: {
          include_logs: query.include_logs,
          include_ai_review: query.include_ai_review,
        },
      })

      if (!data.package_release) {
        throw new Error("Package release not found")
      }

      return data.package_release
    },
    {
      retry: false,
      enabled: Boolean(query),
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
