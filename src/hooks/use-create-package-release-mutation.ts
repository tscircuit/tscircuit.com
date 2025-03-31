import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./use-axios"

export const useCreatePackageReleaseMutation = ({
  onSuccess,
}: { onSuccess?: (packageRelease: PackageRelease) => void } = {}) => {
  const axios = useAxios()

  return useMutation(
    ["createPackageRelease"],
    async ({
      package_id,
      version,
      is_latest = true,
      commit_sha,
      package_name_with_version,
    }: {
      package_id?: string
      version?: string
      is_latest?: boolean
      commit_sha?: string
      package_name_with_version?: string
    }) => {
      // Validate that either package_id + version or package_name_with_version is provided
      if (!package_name_with_version && (!package_id || !version)) {
        throw new Error(
          "Must provide either package_id + version or package_name_with_version",
        )
      }

      const {
        data: { package_release: newPackageRelease },
      } = await axios.post("/package_releases/create", {
        package_id,
        version,
        is_latest,
        commit_sha,
        package_name_with_version,
      })

      if (!newPackageRelease) {
        throw new Error("Failed to create package release")
      }

      return newPackageRelease
    },
    {
      onSuccess: (packageRelease: PackageRelease) => {
        onSuccess?.(packageRelease)
      },
      onError: (error: any) => {
        console.error("Error creating package release:", error)
      },
    },
  )
}
