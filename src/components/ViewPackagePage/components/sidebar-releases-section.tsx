import { Tag, Clock, Globe } from "lucide-react"
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

export default function SidebarReleasesSection() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease({
    include_ai_review: true,
  })
  const { data: latestBuild } = usePackageBuild(
    packageRelease?.latest_package_build_id ?? null,
  )

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

  const { status, label } = getBuildStatus(latestBuild)
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">
        <Link
          href={`/${packageInfo?.name}/releases`}
          className="hover:underline"
        >
          Releases
        </Link>
      </h2>
      <div className="flex flex-col space-y-2">
        <Link
          href={`/${packageInfo?.name}/releases/${packageRelease.package_release_id}`}
          className="flex items-center hover:underline"
        >
          <Tag className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium">v{packageRelease.version}</span>
        </Link>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-gray-500  cursor-default">
                  {timeAgo(new Date(packageRelease.created_at))}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {new Date(packageRelease.created_at).toLocaleString()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {packageRelease?.package_release_website_url && (
          <a
            href={packageRelease.package_release_website_url}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-500  cursor-pointer"
          >
            <Globe className={`size-4 text-gray-500`} />
            <span>Package Preview</span>
          </a>
        )}
      </div>
    </div>
  )
}
