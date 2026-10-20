import { Tag, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { timeAgo } from "@/lib/utils/timeAgo"
import type { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"

interface ReleaseVersionSelectorProps {
  packageId: string
  currentVersion: string | null
  onVersionChange: (version: string, releaseId: string) => void
  latestVersion?: string
}

export default function ReleaseVersionSelector({
  packageId,
  currentVersion,
  onVersionChange,
  latestVersion,
}: ReleaseVersionSelectorProps) {
  const [open, setOpen] = useState(false)
  const {
    data: allReleases,
    isLoading,
    error,
    refetch,
  } = usePackageReleasesByPackageId(packageId, {
    enabled: open,
    staleTime: 60_000,
  })

  const sortedReleases = [...(allReleases ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-[38px] text-sm shadow-none"
          aria-label={`Select release version${currentVersion || latestVersion ? `, current v${currentVersion || latestVersion}` : ""}`}
        >
          <Tag className="h-4 w-4 mr-1.5" />
          <span className="truncate max-w-[80px]">
            {currentVersion || latestVersion
              ? `v${currentVersion || latestVersion}`
              : "Releases"}
          </span>
          <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 max-h-80 overflow-y-auto z-[101] no-scrollbar"
      >
        {isLoading && (
          <DropdownMenuItem disabled>Loading releases...</DropdownMenuItem>
        )}
        {error && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              void refetch()
            }}
          >
            Failed to load releases. Retry
          </DropdownMenuItem>
        )}
        {!isLoading && !error && sortedReleases.length === 0 && (
          <DropdownMenuItem disabled>No releases found.</DropdownMenuItem>
        )}
        {sortedReleases.map((release: PublicPackageRelease) => {
          const isSelected = currentVersion
            ? release.version === currentVersion
            : release.version === latestVersion
          const isReleaseLatest = release.is_latest

          return (
            <DropdownMenuItem
              key={release.package_release_id}
              onClick={() => {
                if (release.version) {
                  onVersionChange(release.version, release.package_release_id)
                }
              }}
              className="flex items-center justify-between py-2 cursor-pointer"
            >
              <div className="flex items-center min-w-0 flex-1">
                <Tag className="h-3.5 w-3.5 mr-2 flex-shrink-0 text-gray-500" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate">
                      v{release.version}
                    </span>
                    {isReleaseLatest && (
                      <span className="px-1 py-0.5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded flex-shrink-0">
                        latest
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 truncate">
                    {timeAgo(new Date(release.created_at))}
                  </span>
                </div>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
