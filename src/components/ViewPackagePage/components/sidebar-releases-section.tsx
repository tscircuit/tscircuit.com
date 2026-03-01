import { Tag, Clock, Globe } from "lucide-react"
import { KicadPcmCommand } from "@/components/KicadPcmCommand"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { timeAgo } from "@/lib/utils/timeAgo"
import { getBuildStatus } from "@/components/preview"
import { Link } from "wouter"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { usePackageFileById, usePackageFiles } from "@/hooks/use-package-files"
import { useMemo } from "react"
import { usePackageDomains } from "@/hooks/use-package-domains"

export default function SidebarReleasesSection() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease({
    include_ai_review: true,
  })
  const { data: latestBuild } = usePackageBuild(
    packageRelease?.latest_package_build_id ?? null,
  )

  const { data: releaseFiles } = usePackageFiles(
    packageInfo?.latest_package_release_id,
  )
  const { data: configFile } = usePackageFileById(
    releaseFiles?.find((f) => f.file_path === "tscircuit.config.json")
      ?.package_file_id ?? null,
  )

  const hasReleaseWebsiteUrl = Boolean(
    packageRelease?.package_release_website_url,
  )
  const { data: domains = [] } = usePackageDomains(
    hasReleaseWebsiteUrl ? null : { package_id: packageInfo?.package_id },
  )
  const previewUrl =
    packageRelease?.package_release_website_url ||
    (domains[0]?.fully_qualified_domain_name
      ? `https://${domains[0].fully_qualified_domain_name}`
      : "")

  const isKicadPcmEnabled = useMemo(() => {
    if (!configFile?.content_text) return false
    try {
      const config = JSON.parse(configFile.content_text)
      return config?.build?.kicadPcm === true
    } catch (e) {
      return false
    }
  }, [configFile])

  if (!packageRelease) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Releases</h2>
        <div className="mb-2">
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mb-3">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="mb-6 text-sm">
      <h2 className="text-lg font-semibold mb-2">
        <Link
          href={`/${packageInfo?.name}/releases`}
          className="hover:underline"
        >
          Releases
        </Link>
      </h2>
      <div className="flex flex-col items-start space-y-2">
        <Link
          href={`/${packageInfo?.name}/releases/${packageRelease.package_release_id}`}
          className="flex items-center w-full justify-start hover:underline"
        >
          <Tag className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium">v{packageRelease.version}</span>
        </Link>
        <div className="flex items-center w-full justify-start">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-gray-500 cursor-default">
                  {timeAgo(new Date(packageRelease.created_at))}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {new Date(packageRelease.created_at).toLocaleString()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {previewUrl && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                >
                  <Globe className="size-4 text-gray-500" />
                  <span>Package Preview</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs break-all">
                {previewUrl}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {isKicadPcmEnabled && previewUrl && (
          <KicadPcmCommand url={`${previewUrl}/pcm/repository.json`} />
        )}
      </div>
    </div>
  )
}
