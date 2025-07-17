import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { useMutation } from "react-query"
import { useAxios } from "./useAxios"

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

      let resolvedVersion = version
      let resolvedPkgName = package_name_with_version

      // Parse version from package_name_with_version if needed
      if (package_name_with_version && !version) {
        const [pkgName, parsedVersion] = package_name_with_version.split("@")
        resolvedVersion = parsedVersion
        resolvedPkgName = pkgName
      } else if (package_name_with_version) {
        const [pkgName] = package_name_with_version.split("@")
        resolvedPkgName = pkgName
      }

      // Default version to 0.0.1 when it contains no digits
      if (!resolvedVersion || !/[0-9]/.test(resolvedVersion)) {
        resolvedVersion = "0.0.1"
      }

      const normalizedPackageNameWithVersion =
        resolvedPkgName && `${resolvedPkgName}@${resolvedVersion}`

      try {
        const {
          data: { package_release: newPackageRelease },
        } = await axios.post("/package_releases/create", {
          package_id,
          version: resolvedVersion,
          is_latest,
          commit_sha,
          package_name_with_version: normalizedPackageNameWithVersion,
        })

        if (!newPackageRelease) {
          throw new Error("Failed to create package release")
        }

        return newPackageRelease
      } catch (error: any) {
        if (
          error.status === 400 &&
          error.data?.error?.error_code === "version_already_exists" &&
          normalizedPackageNameWithVersion
        ) {
          // Update the existing release with the provided data
          await axios.post("/package_releases/update", {
            package_name_with_version: normalizedPackageNameWithVersion,
            is_latest,
            commit_sha,
          })

          const {
            data: { package_release },
          } = await axios.post("/package_releases/get", {
            package_name_with_version: normalizedPackageNameWithVersion,
          })

          if (!package_release) {
            throw new Error("Failed to update package release")
          }

          return package_release as PackageRelease
        }

        throw error
      }
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
