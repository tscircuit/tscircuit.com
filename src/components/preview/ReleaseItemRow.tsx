import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Copy,
  Check,
  GitBranch,
  GitCommitHorizontal,
  PackageIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DropdownAction, Status, StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState } from "react"
import { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"

interface ReleaseItemRowProps {
  release: PublicPackageRelease
  status: Status
  statusLabel: string
  onClick?: () => void
  dropdownActions?: DropdownAction[]
  isLatest?: boolean
  errorMessage?: string | null
}

export const ReleaseItemRow = ({
  release,
  status,
  statusLabel,
  onClick,
  dropdownActions,
  isLatest,
  errorMessage,
}: ReleaseItemRowProps) => {
  const [copied, setCopied] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(release.version || release.package_release_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderGitInfo = () => {
    if (!release.github_branch_name && !release.github_commit_sha) return null

    return (
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-1.5 text-gray-900">
          <GitBranch className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
          <span className="text-sm font-mono truncate text-gray-600">
            {release.github_branch_name ||
              (release.is_pr_preview
                ? `${release.github_pr_number ? `#${release.github_pr_number}` : "Unknown PR"}`
                : "main")}
          </span>
        </div>
        {release?.github_commit_sha && (
          <div className="flex items-center gap-1.5 text-gray-900">
            <GitCommitHorizontal className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
            <span className="text-sm font-mono text-gray-600 truncate">
              {release.github_commit_sha.slice(0, 7)}
            </span>
          </div>
        )}
      </div>
    )
  }

  const version = release.version || release.package_release_id
  const displayVersion = release.version ? version : version.slice(0, 8)

  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
      onClick={onClick}
    >
      <div className="flex flex-col gap-3 sm:hidden w-full">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-gray-900"
                onClick={handleCopy}
              >
                {displayVersion}
              </span>
              {isLatest && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                  Latest
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">Release</div>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusIcon status={status} />
            <span
              className={`text-sm font-medium ${
                status === "success"
                  ? "text-gray-700"
                  : status === "error"
                    ? "text-red-600"
                    : status === "building"
                      ? "text-blue-600"
                      : "text-gray-600"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-red-600 font-mono break-all">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-between items-end">
          <div className="flex-1 min-w-0 pr-4">{renderGitInfo()}</div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="text-xs font-medium text-gray-500">
              {formatTimeAgo(release.created_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 w-full items-center">
        <div className="col-span-3 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 p-1 -ml-1 rounded transition-colors"
                    onClick={handleCopy}
                  >
                    <span className="font-bold text-sm text-gray-900 truncate">
                      {displayVersion}
                    </span>
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{version}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isLatest && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                Latest
              </span>
            )}
          </div>
        </div>

        <div className="col-span-2 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <StatusIcon status={status} />
            <span className="text-sm font-medium text-gray-700">
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="col-span-4 flex flex-col justify-center min-w-0 pl-6">
          {errorMessage ? (
            <div className="flex items-start">
              <span
                className="text-xs text-red-600 font-mono truncate max-w-full"
                title={errorMessage}
              >
                {errorMessage}
              </span>
            </div>
          ) : (
            renderGitInfo()
          )}
        </div>

        <div className="col-span-3 flex items-center justify-end gap-4 min-w-0">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-sm text-gray-700 whitespace-nowrap font-[450]">
              {formatTimeAgo(release.created_at)}
            </span>
          </div>

          {dropdownActions && dropdownActions.length > 0 && (
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDropdownOpen(true)
                  }}
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownActions
                  .filter((action) => !action.hidden)
                  .map((action) => (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDropdownOpen(false)
                        action.onClick(e)
                      }}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}

export const ReleaseItemRowSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-100">
    <div className="sm:hidden w-full space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>

    <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 w-full items-center">
      <div className="col-span-3 space-y-2">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="col-span-2 space-y-2">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="col-span-4 space-y-2 pl-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="col-span-3 flex justify-end">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </div>
)
