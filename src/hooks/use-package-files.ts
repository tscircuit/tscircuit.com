import { PackageFile } from "fake-snippets-api/lib/db/schema"
import { useQuery, UseQueryOptions } from "react-query"
import { useAxios } from "./use-axios"

type PackageFileQuery =
  | {
      package_file_id: string
    }
  | {
      package_release_id: string
      file_path: string
    }
  | {
      package_id: string
      version?: string
      file_path: string
    }
  | {
      package_name: string
      version?: string
      file_path: string
    }
  | {
      package_name_with_version: string
      file_path: string
    }

export const usePackageFile = (
  query: PackageFileQuery | null,
  opts?: UseQueryOptions,
) => {
  const axios = useAxios()

  return useQuery<PackageFile, Error & { status: number }>(
    ["packageFile", query],
    async () => {
      if (!query) return

      const { data } = await axios.post("/package_files/get", query)

      if (!data.package_file) {
        throw new Error("Package file not found")
      }

      return data.package_file
    },
    {
      retry: false,
      enabled: Boolean(query),
      ...(opts as any),
    },
  )
}

// Convenience hooks for common use cases
export const usePackageFileById = (packageFileId: string | null) => {
  return usePackageFile(
    packageFileId ? { package_file_id: packageFileId } : null,
  )
}

export const usePackageFileByPath = (
  packageNameWithVersion: string | null,
  filePath: string | null,
) => {
  return usePackageFile(
    packageNameWithVersion && filePath
      ? {
          package_name_with_version: packageNameWithVersion,
          file_path: filePath,
        }
      : null,
  )
}

export const usePackageFileByRelease = (
  packageReleaseId: string | null,
  filePath: string | null,
) => {
  return usePackageFile(
    packageReleaseId && filePath
      ? {
          package_release_id: packageReleaseId,
          file_path: filePath,
        }
      : null,
  )
}

// Hook to list all files for a package release
export const usePackageFiles = (packageReleaseId: string | undefined) => {
  const axios = useAxios()

  return useQuery<PackageFile[], Error & { status: number }>(
    ["package-files", packageReleaseId],
    async () => {
      if (!packageReleaseId) {
        throw new Error("Package release ID is required")
      }
      const { data } = await axios.post("/package_files/list", {
        package_release_id: packageReleaseId,
      })
      return data.package_files
    },
    {
      enabled: Boolean(packageReleaseId),
      retry: false,
    },
  )
}
