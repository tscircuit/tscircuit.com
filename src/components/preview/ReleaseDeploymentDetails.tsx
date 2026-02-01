import { useState, useEffect, useMemo } from "react"
import { useUsercodeApiStatus } from "@/hooks/use-usercode-api-status"
import { usePackageFileByRelease } from "@/hooks/use-package-files"
import {
  Globe,
  GitBranch,
  GitCommit,
  ExternalLink,
  Boxes,
  Box,
  Cpu,
  Layers,
  RefreshCw,
} from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import type {
  Package,
  PackageBuild,
  PublicPackageRelease,
  PublicOrgSchema,
} from "fake-snippets-api/lib/db/schema"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from "wouter"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
import { InstallCommand } from "@/components/InstallCommand"
import { getBuildStatus, StatusIcon } from "."

interface ReleaseDeploymentDetailsProps {
  pkg: Package
  packageRelease: PublicPackageRelease
  latestBuild: PackageBuild | null
  canManagePackage?: boolean
  isRebuildLoading?: boolean
  isPollingAfterRebuild?: boolean
  onRebuild?: () => void
  organization?: PublicOrgSchema | null
}

export function ReleaseDeploymentDetails({
  pkg,
  packageRelease,
  latestBuild,
  canManagePackage = false,
  isRebuildLoading = false,
  isPollingAfterRebuild = false,
  onRebuild,
  organization,
}: ReleaseDeploymentDetailsProps) {
  const { data: statusChecks } = useUsercodeApiStatus()
  const userCodeStatus = statusChecks?.checks.find(
    (c) => c.service === "usercode_api",
  )
  const buildStatus = getBuildStatus(latestBuild)
  const isWaitingForBuild =
    isPollingAfterRebuild && buildStatus.status !== "building"
  const isBuildInProgress =
    buildStatus.status === "building" || isWaitingForBuild

  const [waitingSeconds, setWaitingSeconds] = useState(0)

  useEffect(() => {
    if (!isWaitingForBuild) {
      setWaitingSeconds(0)
      return
    }

    setWaitingSeconds(1)
    const interval = setInterval(() => {
      setWaitingSeconds((s) => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isWaitingForBuild])

  const buildDuration =
    latestBuild?.user_code_job_started_at &&
    latestBuild?.user_code_job_completed_at
      ? Math.floor(
          (new Date(latestBuild.user_code_job_completed_at).getTime() -
            new Date(latestBuild.user_code_job_started_at).getTime()) /
            1000,
        )
      : null

  const images = [
    {
      label: "3D",
      url: packageRelease.cad_preview_image_url,
      icon: Box,
      tab: "cad",
    },
    {
      label: "Schematic",
      url: packageRelease.sch_preview_image_url,
      icon: Layers,
      tab: "schematic",
    },
    {
      label: "PCB",
      url: packageRelease.pcb_preview_image_url,
      icon: Cpu,
      tab: "pcb",
    },
  ].filter((img) => img.url)

  const handleImageClick = (tab: string) => {
    if (!packageRelease.package_release_website_url) return
    const url = new URL(packageRelease.package_release_website_url)
    url.hash = `tab=${tab}`
    window.open(url.toString(), "_blank")
  }

  const { data: configFile } = usePackageFileByRelease(
    packageRelease.package_release_id,
    "tscircuit.config.json",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-gray-100 pb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold select-none text-gray-900 tracking-tight">
          Release v{packageRelease.version}
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {canManagePackage && (
            <TooltipProvider>
              <Tooltip open={isWaitingForBuild ? undefined : false}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 bg-white hover:bg-gray-50 flex-shrink-0"
                    disabled={
                      isRebuildLoading ||
                      buildStatus.status === "building" ||
                      !packageRelease
                    }
                    onClick={onRebuild}
                  >
                    <RefreshCw
                      className={`size-3 sm:size-4 mr-2 ${isRebuildLoading || isBuildInProgress ? "animate-spin" : ""}`}
                    />
                    {buildStatus.status === "building"
                      ? "Building..."
                      : isRebuildLoading
                        ? "Triggering..."
                        : isWaitingForBuild
                          ? `Waiting (${waitingSeconds}s)`
                          : "Rebuild"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Click to force rebuild</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {packageRelease.package_release_website_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                window.open(
                  packageRelease.package_release_website_url!,
                  "_blank",
                )
              }}
            >
              <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              Visit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images Section */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.map((img, idx) => {
                let bgColor = "bg-gray-50"
                if (img.label === "Schematic") bgColor = "bg-[#f5f1ed]"
                else if (img.label === "PCB") bgColor = "bg-black"
                else if (img.label === "3D") bgColor = "bg-gray-100"

                return (
                  <div
                    key={img.label}
                    className={`relative group  border rounded-lg overflow-hidden ${bgColor} group flex flex-col items-center justify-center ${
                      idx === 0 && images.length === 3
                        ? "col-span-2 aspect-[2/1]"
                        : "col-span-1 aspect-[4/3]"
                    } ${packageRelease.package_release_website_url ? "cursor-pointer" : ""}`}
                    onClick={() => handleImageClick(img.tab)}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={img.url!}
                        alt={`${img.label} Preview`}
                        className={`max-w-full max-h-full w-auto h-auto object-contain ${packageRelease.package_release_website_url ? "group-hover:scale-[1.02] transition-transform" : ""}`}
                      />
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700 flex items-center gap-1.5 shadow-sm">
                      <img.icon className="w-3.5 h-3.5" />
                      {img.label}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 lg:h-full select-none bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
              <Box className="w-10 h-10 mb-2 opacity-50" />
              <p>No preview images available</p>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 h-full">
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Owner
              </p>
              <div className="flex items-center gap-1">
                <GithubAvatarWithFallback
                  username={
                    organization?.tscircuit_handle ||
                    pkg.org_owner_tscircuit_handle
                  }
                  imageUrl={organization?.avatar_url}
                  className="size-8 sm:size-6 flex-shrink-0 border border-gray-200"
                  fallbackClassName="text-xs sm:text-sm font-medium"
                  colorClassName="bg-gray-100 text-gray-600"
                />
                <div className="flex flex-col min-w-0">
                  <Link
                    to={`/${pkg.org_owner_tscircuit_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:text-blue-600 leading-tight truncate"
                  >
                    {pkg.org_owner_tscircuit_handle || "Unknown"}
                  </Link>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Status
              </p>
              <div className="flex items-center gap-1">
                <StatusIcon size={4} status={buildStatus.status} />
                <span className="text-sm font-medium text-gray-900">
                  {buildStatus.label}
                </span>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Duration
              </p>
              <div className="flex items-center gap-2 text-gray-900">
                {buildDuration !== null &&
                latestBuild?.user_code_job_completed_at ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm font-medium cursor-default">
                          {buildDuration}s
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatTimeAgo(latestBuild.user_code_job_completed_at)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-sm font-medium">—</span>
                )}
              </div>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Source
              </p>
              {pkg.github_repo_full_name ? (
                <div className="flex items-center gap-2 min-w-0">
                  {packageRelease.is_pr_preview ? (
                    <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <GitCommit className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <a
                    href={
                      packageRelease.is_pr_preview
                        ? `https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease.github_pr_number}`
                        : `https://github.com/${pkg.github_repo_full_name}/tree/${packageRelease.github_branch_name || "main"}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  >
                    {packageRelease.is_pr_preview
                      ? `PR #${packageRelease.github_pr_number}`
                      : packageRelease.github_branch_name || "main"}
                  </a>
                </div>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>

            {/* Domains */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                Domains
              </p>
              {packageRelease.package_release_website_url ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a
                      href={packageRelease.package_release_website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                    >
                      {packageRelease.package_release_website_url.replace(
                        /^https?:\/\//,
                        "",
                      )}
                    </a>
                  </div>
                  {isKicadPcmEnabled && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Boxes className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`${packageRelease.package_release_website_url}/pcm/repository.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                      >
                        KiCad PCM Repository
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>

            {/* Builder Status */}
            {userCodeStatus?.status == "error" && (
              <div className="space-y-1.5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  Cloud Build Service
                </p>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  <div
                    className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0 bg-red-500`}
                  />
                  <a
                    href="https://status.tscircuit.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                  >
                    Degraded
                  </a>
                  {userCodeStatus?.error && (
                    <span
                      className="text-xs text-red-500 truncate"
                      title={userCodeStatus.error}
                    >
                      ({userCodeStatus.error})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Install Command */}
            <div className="space-y-1.5">
              <InstallCommand
                packageName={pkg.name}
                version={packageRelease.version}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
