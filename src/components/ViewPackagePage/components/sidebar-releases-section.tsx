import { Tag, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { timeAgo } from "@/lib/utils/timeAgo"
import { getBuildStatus, StatusIcon } from "@/components/preview"
import { Link, useLocation, useParams } from "wouter"
import { usePackageBuild } from "@/hooks/use-package-builds"

export default function SidebarReleasesSection() {
  const { packageInfo } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease({
    include_ai_review: true,
  })
  const { data: releases } = usePackageReleasesByPackageId(
    packageInfo?.package_id ?? null,
  )
  const { data: latestBuild } = usePackageBuild(
    packageRelease?.latest_package_build_id ?? null,
  )
  const [, setLocation] = useLocation()
  const { author, packageName } = useParams()

  const handleVersionChange = (value: string) => {
    if (value === "latest") {
      setLocation(`/${author}/${packageName}`)
    } else {
      setLocation(`/${author}/${packageName}?version=${value}`)
    }
  }

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

  const { status, label } = latestBuild
    ? getBuildStatus(latestBuild)
    : { status: "pending", label: "pending" }
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
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500 dark:text-[#8b949e]" />
          <Select
            value={
              packageRelease.is_latest
                ? "latest"
                : (packageRelease.version ?? packageRelease.package_release_id)
            }
            onValueChange={handleVersionChange}
          >
            <SelectTrigger className="h-7 w-fit gap-1 px-2 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-0">
              {releases?.map((release) => (
                <SelectItem
                  key={release.package_release_id}
                  value={
                    release.is_latest
                      ? "latest"
                      : (release.version ?? release.package_release_id)
                  }
                >
                  v{release.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-[#8b949e]" />
          <span className="text-sm text-gray-500 dark:text-[#8b949e]">
            {timeAgo(new Date(packageRelease.created_at))}
          </span>
        </div>
        {latestBuild && (
          <Link
            href={`/${packageInfo?.name}/releases`}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#8b949e]"
          >
            <StatusIcon status={status} />
            <span>Package Preview {label}</span>
          </Link>
        )}
      </div>
      {/* <a href="#" className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm">
        Push a new release
      </a> */}
    </div>
  )
}
