import { useQuery } from "react-query"
import { useAxios } from "./use-axios"
import { PackageBuild } from "fake-snippets-api/lib/db/schema"

interface UsePackageBuildsParams {
  package_id?: string
  package_release_id?: string
}

export const usePackageBuilds = (params: UsePackageBuildsParams | null) => {
  const axios = useAxios()

  return useQuery<PackageBuild[], Error & { status: number }>(
    ["packageBuilds", params],
    async () => {
      if (!params || (!params.package_id && !params.package_release_id)) {
        throw new Error(
          "Either package_id or package_release_id must be provided",
        )
      }

      const { data } = await axios.get<{ package_builds: PackageBuild[] }>(
        "/package_builds/list",
        {
          params: {
            ...(params.package_id ? { package_id: params.package_id } : {}),
            ...(params.package_release_id
              ? { package_release_id: params.package_release_id }
              : {}),
          },
        },
      )

      if (!data.package_builds) {
        return []
      }

      return data.package_builds
    },
    {
      enabled: Boolean(
        params && (params.package_id || params.package_release_id),
      ),
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
    },
  )
}

export const usePackageBuildsByPackageId = (packageId: string | null) => {
  return usePackageBuilds(packageId ? { package_id: packageId } : null)
}

export const usePackageBuildsByReleaseId = (releaseId?: string | null) => {
  return usePackageBuilds(releaseId ? { package_release_id: releaseId } : null)
}

export const usePackageBuild = (packageBuildId: string | null) => {
  const axios = useAxios()

  return useQuery<PackageBuild, Error & { status: number }>(
    ["packageBuild", packageBuildId],
    async () => {
      if (!packageBuildId) {
        throw new Error("package_build_id is required")
      }

      const { data } = await axios.get("/package_builds/get", {
        params: {
          package_build_id: packageBuildId,
        },
      })

      if (!data.package_build) {
        throw new Error("Package build not found")
      }

      return data.package_build
    },
    {
      enabled: Boolean(packageBuildId),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )
}
