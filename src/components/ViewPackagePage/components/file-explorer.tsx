import { Clock, FileText, Folder, Tag } from "lucide-react"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { Skeleton } from "@/components/ui/skeleton"
import { timeAgo } from "@/lib/utils/timeAgo"

export default function FileExplorer() {
  const { packageInfo } = useCurrentPackageInfo()
  const { data: packageRelease } = usePackageReleaseById(
    packageInfo?.latest_package_release_id,
  )

  return (
    <div className="border border-gray-200 dark:border-[#30363d] rounded-md overflow-hidden">
      <div className="flex items-center px-4 py-2 md:py-3 bg-gray-100 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d]">
        {/* Desktop view */}
        <div className="hidden md:flex items-center text-xs">
          <Tag className="h-4 w-4 mr-1 text-gray-500 dark:text-[#8b949e]" />
          {packageRelease?.version ? (
            <span className="text-gray-500 dark:text-[#8b949e]">
              v{packageRelease.version}
            </span>
          ) : (
            <Skeleton className="h-4 w-16" />
          )}
          <div className="ml-2 text-green-500 dark:text-[#3fb950]">✓</div>
        </div>
        <div className="hidden md:flex ml-auto items-center text-xs text-gray-500 dark:text-[#8b949e]">
          <Clock className="h-4 w-4 mr-1" />
          {packageRelease?.created_at ? (
            <span>{timeAgo(new Date(packageRelease.created_at))}</span>
          ) : (
            <Skeleton className="h-4 w-16" />
          )}
          <div className="ml-4 flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            {packageRelease ? (
              <span>v{packageRelease.version}</span>
            ) : (
              <Skeleton className="h-4 w-16" />
            )}
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 dark:text-[#8b949e]">
              v{packageRelease?.version}
            </span>
            <div className="ml-1 text-green-500 dark:text-[#3fb950]">✓</div>
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#8b949e]">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-0.5" />
              <span>2d</span>
            </div>
            <div className="flex items-center">
              <Tag className="h-3 w-3 mr-0.5" />
              <span>12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
