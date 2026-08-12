import {
  type PackageBuildReference,
  waitForNewPackageBuild,
} from "@/lib/wait-for-new-package-build"
import { useCallback, useState } from "react"
import { useLocation } from "wouter"
import { useAxios } from "./use-axios"
import { useToast } from "./use-toast"

interface SyncablePackage {
  name: string
  package_id: string
}

export const useManualGitHubSync = (packageInfo?: SyncablePackage) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const axios = useAxios()
  const { toast } = useToast()
  const [, navigate] = useLocation()

  const handleGitHubSync = useCallback(async () => {
    if (!packageInfo?.package_id || isSyncing) return

    setIsSyncing(true)
    let syncWasAccepted = false

    const listBuilds = async () => {
      const { data } = await axios.post<{
        package_releases: Array<{
          is_pr_preview?: boolean
          latest_package_build_id?: string | null
          package_release_id: string
        }>
      }>("/package_releases/list", {
        package_id: packageInfo.package_id,
      })

      return (data.package_releases ?? []).flatMap<PackageBuildReference>(
        (release) =>
          !release.is_pr_preview && release.latest_package_build_id
            ? [
                {
                  package_build_id: release.latest_package_build_id,
                  package_release_id: release.package_release_id,
                },
              ]
            : [],
      )
    }

    try {
      const existingBuildIds = new Set(
        (await listBuilds()).map((build) => build.package_build_id),
      )
      const response = await axios.post("/packages/start_github_sync", {
        package_id: packageInfo.package_id,
      })
      const result = response.data?.start_github_sync_result

      if (!result?.ok) {
        throw new Error(result?.message || "Failed to start GitHub sync")
      }

      syncWasAccepted = true
      toast({
        title: "Sync started",
        description: "Waiting for the new build to be created...",
      })

      const newBuild = await waitForNewPackageBuild({
        existingBuildIds,
        listBuilds,
      })

      navigate(
        `/${packageInfo.name}/releases/${newBuild.package_release_id}/builds/${newBuild.package_build_id}`,
      )
    } catch (error: any) {
      if (syncWasAccepted) {
        toast({
          title: "Sync queued",
          description:
            "The sync was accepted, but the new build is not available yet. Check the releases page in a moment.",
        })
      } else {
        toast({
          title: "Sync failed",
          description: error?.data?.message || error?.message,
          variant: "destructive",
        })
      }
    } finally {
      setIsSyncing(false)
    }
  }, [axios, isSyncing, navigate, packageInfo, toast])

  return { handleGitHubSync, isSyncing }
}
