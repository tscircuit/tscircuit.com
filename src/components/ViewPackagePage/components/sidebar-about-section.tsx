import { Badge } from "@/components/ui/badge"
import {
  GitFork,
  Star,
  Settings,
  Link,
  Github,
  Plus,
  RefreshCw,
  Boxes,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, useEffect, useMemo } from "react"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { getLicenseFromLicenseContent } from "@/lib/getLicenseFromLicenseContent"
import { PackageInfo } from "@/lib/types"
import { useOrganization } from "@/hooks/use-organization"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useGetOrgMember } from "@/hooks/use-get-org-member"
import { Link, useLocation } from "wouter"

interface SidebarAboutSectionProps {
  packageInfo?: PackageInfo
  isLoading?: boolean
  onLicenseClick?: () => void
}

export default function SidebarAboutSection({
  onLicenseClick,
}: SidebarAboutSectionProps = {}) {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease({
    include_ai_review: true,
  })
  const [, navigate] = useLocation()

  const { organization } = useOrganization(
    packageInfo?.owner_org_id
      ? { orgId: String(packageInfo.owner_org_id) }
      : packageInfo?.owner_github_username
        ? { github_handle: packageInfo.owner_github_username }
        : {},
  )

  const { data: releaseFiles } = usePackageFiles(
    packageInfo?.latest_package_release_id,
  )
  const { data: configFile } = usePackageFileById(
    releaseFiles?.find((f) => f.file_path === "tscircuit.config.json")
      ?.package_file_id ?? null,
  )

  const isKicadPcmEnabled = useMemo(() => {
    if (!configFile?.content_text) return false
    try {
      const config = JSON.parse(configFile.content_text)
      return config?.build?.kicadPcm === true
    } catch (e) {
      return false
    }
  }, [configFile])

  const licenseFileId = useMemo(() => {
    return (
      releaseFiles?.find((f) => f.file_path === "LICENSE")?.package_file_id ||
      null
    )
  }, [releaseFiles])
  const { data: licenseFileMeta } = usePackageFileById(licenseFileId)
  const currentLicense = useMemo(() => {
    if (packageInfo?.latest_license) {
      return packageInfo?.latest_license
    }
    if (licenseFileMeta?.content_text) {
      return getLicenseFromLicenseContent(licenseFileMeta.content_text)
    }
    return null
  }, [licenseFileMeta, packageInfo?.latest_license])
  const topics = packageInfo?.is_package ? ["Package"] : ["Board"]
  const isLoading = !packageInfo || !packageRelease
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const isOwner =
    isLoggedIn &&
    packageInfo?.owner_github_username ===
      useGlobalStore((s) => s.session?.github_username)

  const canManageOrg = useMemo(() => {
    if (isOwner) return isOwner
    if (organization) {
      return organization.user_permissions?.can_manage_org
    }
    return false
  }, [isOwner, organization])

  const currentAccountId = useGlobalStore((s) => s.session?.account_id)
  const { data: orgMember } = useGetOrgMember({
    orgId: packageInfo?.owner_org_id,
    accountId: currentAccountId,
  })

  const canManagePackage = isOwner || Boolean(orgMember)

  const [isSyncing, setIsSyncing] = useState(false)

  const axios = useAxios()
  const { toast } = useToast()

  const handleGitHubSync = async () => {
    if (!packageInfo?.package_id) return
    setIsSyncing(true)
    try {
      const response = await axios.post("/packages/start_github_sync", {
        package_id: packageInfo.package_id,
      })
      if (response.data?.start_github_sync_result?.ok) {
        toast({
          title: "Sync started",
          description: response.data.start_github_sync_result.message,
        })
      }
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error?.data?.message || "Failed to start GitHub sync",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const websiteUrl =
    packageRelease?.package_release_website_url || packageInfo?.website || ""

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("open_edit_package_dialog") === "true") {
      params.delete("open_edit_package_dialog")
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "")
      window.history.replaceState({}, "", newUrl)
      if (packageInfo) navigate(`/${packageInfo.name}/settings`)
    }
  }, [packageInfo, navigate])

  if (isLoading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <Skeleton className="h-4 w-full mb-3" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">About</h2>
        {canManagePackage && packageInfo && (
          <Link href={`/${packageInfo.name}/settings`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Edit package details"
            >
              <Settings className="size-[0.9rem] text-gray-500" />
            </Button>
          </Link>
        )}
      </div>
      <p className="text-sm mb-3">
        {packageInfo?.description || packageInfo?.ai_description}
      </p>
      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium dark:text-[#58a6ff] hover:underline text-sm flex items-center mb-2 max-w-full overflow-hidden"
        >
          <Link className="size-[0.9rem] min-w-[16px] mr-1 flex-shrink-0" />
          <span className="truncate">{websiteUrl}</span>
        </a>
      )}
      {isKicadPcmEnabled && packageRelease?.package_release_website_url && (
        <a
          href={`${packageRelease.package_release_website_url}/pcm/repository.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium dark:text-[#58a6ff] hover:underline text-sm flex items-center mb-4 max-w-full overflow-hidden"
        >
          <Boxes className="h-4 w-4 font-medium min-w-[16px] mr-1 flex-shrink-0" />
          <span className="truncate">KiCad PCM Repository</span>
        </a>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {topics.map((topic, index) => (
          <Badge
            key={index}
            variant="outline"
            className="text-xs rounded-full px-2 py-0.5 bg-blue-100 dark:bg-[#1f6feb33] text-blue-600 dark:text-[#58a6ff] border-blue-300 dark:border-[#1f6feb66]"
          >
            {topic}
          </Badge>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <button
          className="flex items-center hover:underline hover:underline-offset-2 cursor-pointer hover:decoration-gray-500"
          onClick={onLicenseClick}
          disabled={!onLicenseClick}
        >
          <svg
            className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 0 1 0 1.5h-.427l2.111 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 0 0-.124-.033H8.75V13h2.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1 0-1.5h2.5V3.5h-.984a.245.245 0 0 0-.124.033l-1.29.736c-.264.152-.563.231-.868.231h-.162l2.112 4.692a.75.75 0 0 1-.154.838l-.53-.53.53.53-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 0 1-2.023-.454 3.544 3.544 0 0 1-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 0 1-.154-.838L2.178 4.5H1.75a.75.75 0 0 1 0-1.5h2.234a.249.249 0 0 0 .125-.033l1.29-.736c.263-.15.561-.231.865-.231H7.25V.75a.75.75 0 0 1 1.5 0Zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327Zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327Z"></path>
          </svg>
          <span>{currentLicense ?? "Unset"} license</span>
        </button>

        <div className="flex items-center">
          <Star className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span>{packageInfo?.star_count} stars </span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span>{(packageInfo as any)?.fork_count ?? "0"} forks</span>
        </div>
        {packageInfo?.github_repo_full_name ? (
          <div className="flex items-center justify-between">
            <a
              target="_blank"
              href={`https://github.com/${packageInfo.github_repo_full_name}`}
              className="flex items-center hover:underline hover:underline-offset-2 cursor-pointer hover:decoration-gray-500"
            >
              <Github className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
              <span>{packageInfo?.github_repo_full_name.split("/")[1]}</span>
            </a>
            {canManagePackage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleGitHubSync}
                      disabled={isSyncing}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 text-gray-500 dark:text-[#8b949e] ${isSyncing ? "animate-spin" : ""}`}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manually sync from GitHub</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          <>
            {canManageOrg && packageInfo && (
              <Link
                href={`/${packageInfo.name}/settings`}
                className="flex items-center hover:underline hover:underline-offset-2 cursor-pointer hover:decoration-gray-500"
                title="Connect GitHub"
              >
                <div className="relative mr-2">
                  <Github className="h-4 w-4 text-gray-500 dark:text-[#8b949e]" />
                  <Plus className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-gray-500 dark:text-[#8b949e] bg-white dark:bg-[#0d1117] rounded-full" />
                </div>
                <span>Connect GitHub</span>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}
