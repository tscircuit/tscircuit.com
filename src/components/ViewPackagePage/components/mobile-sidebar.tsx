import {
  GitFork,
  Star,
  Tag,
  Settings,
  LinkIcon,
  Github,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Button } from "@/components/ui/button"
import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import PreviewImageSquares from "./preview-image-squares"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useOrganization } from "@/hooks/use-organization"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useGetOrgMember } from "@/hooks/use-get-org-member"
import { usePackageDomains } from "@/hooks/use-package-domains"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link, useLocation } from "wouter"

interface MobileSidebarProps {
  isLoading?: boolean
  onViewChange: (view: "schematic" | "pcb" | "3d") => void
}

const MobileSidebar = ({
  isLoading = false,
  onViewChange,
}: MobileSidebarProps) => {
  const { packageInfo } = useCurrentPackageInfo()
  const [, navigate] = useLocation()

  const topics = useMemo(
    () => (packageInfo?.is_package ? ["Package"] : ["Board"]),
    [packageInfo?.is_package],
  )
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const isOwner =
    isLoggedIn &&
    packageInfo?.owner_github_username ===
      useGlobalStore((s) => s.session?.github_username)

  const { organization } = useOrganization(
    packageInfo?.owner_org_id
      ? { orgId: String(packageInfo.owner_org_id) }
      : packageInfo?.owner_github_username
        ? { github_handle: packageInfo.owner_github_username }
        : {},
  )

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

  const handleGitHubSync = useCallback(async () => {
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
  }, [packageInfo?.package_id, axios, toast])

  const { packageRelease } = useCurrentPackageRelease()
  const { data: domains = [] } = usePackageDomains({
    package_release_id: packageRelease?.package_release_id,
  })
  const websiteUrl =
    domains[0]?.fully_qualified_domain_name
      ? `https://${domains[0].fully_qualified_domain_name}`
      : packageRelease?.package_release_website_url || packageInfo?.website || ""

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
      <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d] md:hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm text-gray-700 dark:text-[#c9d1d9]">
          {packageInfo?.description || packageInfo?.ai_description || ""}
        </p>
        {isOwner && packageInfo && (
          <Link href={`/${packageInfo.name}/settings`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ml-2 flex-shrink-0"
              title="Edit package details"
            >
              <Settings className="h-4 w-4 text-gray-500" />
            </Button>
          </Link>
        )}
      </div>

      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-medium dark:text-[#58a6ff] hover:underline text-sm flex items-center mb-4 max-w-full overflow-hidden"
        >
          <LinkIcon className="h-4 w-4 min-w-[16px] mr-1 flex-shrink-0" />
          <span className="truncate">{websiteUrl}</span>
        </a>
      )}

      {/* Tags/Topics */}
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

      <div className="text-sm mb-2">
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

      <div className="flex justify-between text-sm">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${packageInfo.star_count} stars`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <GitFork className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span className="mr-4">
            {packageInfo ? (
              `${(packageInfo as any).fork_count ?? 0} forks`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
        <div className="flex items-center">
          <Tag className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          <span>
            {packageInfo ? (
              `v${packageInfo.latest_version || "-"}`
            ) : (
              <Skeleton className="h-4 w-12 inline-block" />
            )}
          </span>
        </div>
      </div>

      <div>
        <PreviewImageSquares
          large
          packageInfo={packageInfo}
          onViewChange={onViewChange}
        />
      </div>
    </div>
  )
}

export default React.memo(MobileSidebar)
