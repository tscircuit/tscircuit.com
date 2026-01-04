import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"

export const formatBuildDuration = (
  startedAt?: string | null,
  completedAt?: string | null,
): string | null => {
  if (!startedAt) return null
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const durationMs = end - start

  const seconds = Math.floor(durationMs / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

interface DropdownAction {
  label: string
  onClick: (e: React.MouseEvent) => void
  hidden?: boolean
}

interface PackageReleaseOrBuildItemRowProps {
  package_release_or_build_id: string
  label?: string
  subtitle?: string
  status: "pending" | "building" | "success" | "error" | "queued"
  statusLabel: string
  duration: string | null
  createdAt: string
  onClick?: () => void
  dropdownActions?: DropdownAction[]
  middleContent?: React.ReactNode
  isLatest?: boolean
}

export const PackageReleaseOrBuildItemRow = ({
  package_release_or_build_id,
  label,
  subtitle,
  status,
  statusLabel,
  duration,
  createdAt,
  onClick,
  dropdownActions,
  middleContent,
  isLatest,
}: PackageReleaseOrBuildItemRowProps) => {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Mobile Layout */}
      <div className="flex items-start justify-between gap-2 sm:hidden">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {package_release_or_build_id}
            </p>
            {subtitle && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                {subtitle}
              </span>
            )}
            {isLatest && (
              <span className="text-xs font-medium text-blue-500 flex-shrink-0">
                Latest
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <StatusIcon status={status} />
            <span
              className={`text-xs font-medium ${
                status === "success"
                  ? "text-green-500"
                  : status === "error"
                    ? "text-red-500"
                    : status === "building"
                      ? "text-blue-500"
                      : "text-gray-500"
              }`}
            >
              {statusLabel}
            </span>
            <span className="text-xs text-gray-500 tabular-nums">
              {duration || "—"}
            </span>
          </div>
          {label && <p className="text-xs text-gray-400">{label}</p>}
        </div>
        <div className="flex items-start gap-2 flex-shrink-0">
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {formatTimeAgo(createdAt)}
          </span>
          {dropdownActions && dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
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

      {/* Desktop Layout - ID Column */}
      <div className="hidden sm:block w-[140px] flex-shrink-0 overflow-hidden">
        <p className="text-sm font-medium text-gray-900 truncate">
          {package_release_or_build_id}
        </p>
        <div className="flex items-center gap-1">
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
          {isLatest && (
            <span className="text-sm font-medium text-blue-500">Latest</span>
          )}
        </div>
      </div>

      {/* Desktop Layout - Status Column */}
      <div className="hidden sm:block w-[100px] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <StatusIcon status={status} />
          <span
            className={`text-sm font-medium ${
              status === "success"
                ? "text-green-500"
                : status === "error"
                  ? "text-red-500"
                  : status === "building"
                    ? "text-blue-500"
                    : "text-gray-500"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-gray-500 tabular-nums">{duration || "—"}</p>
      </div>

      {/* Desktop Layout - Middle Content (optional, e.g., git info) */}
      {middleContent && (
        <div className="hidden sm:block flex-1 min-w-0 overflow-hidden">
          {middleContent}
        </div>
      )}

      {/* Desktop Layout - Time and Actions */}
      <div className="hidden sm:flex items-center justify-end gap-3 flex-shrink-0">
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatTimeAgo(createdAt)}
        </span>
        {dropdownActions && dropdownActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
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
  )
}

export const PackageReleaseOrBuildItemRowSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 sm:py-4">
    <div className="flex justify-between gap-2 sm:hidden">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </div>
    <div className="hidden sm:block w-[140px] flex-shrink-0">
      <Skeleton className="h-5 w-20 mb-1" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="hidden sm:block w-[100px] flex-shrink-0">
      <Skeleton className="h-5 w-16 mb-1" />
      <Skeleton className="h-4 w-12" />
    </div>
    <div className="hidden sm:block flex-1 min-w-0">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="hidden sm:flex items-center justify-end gap-3 flex-shrink-0">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  </div>
)
