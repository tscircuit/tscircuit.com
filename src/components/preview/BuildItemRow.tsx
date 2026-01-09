import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Copy, Check } from "lucide-react"
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

interface BuildItemRowProps {
  build_id: string
  status: Status
  statusLabel: string
  duration: string | null
  createdAt: string
  onClick?: () => void
  dropdownActions?: DropdownAction[]
  isLatest?: boolean
}

export const BuildItemRow = ({
  build_id,
  status,
  statusLabel,
  duration,
  createdAt,
  onClick,
  dropdownActions,
  isLatest,
}: BuildItemRowProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(build_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
      onClick={onClick}
    >
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 sm:hidden w-full">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-semibold text-gray-900"
                onClick={handleCopy}
              >
                {build_id.slice(0, 8)}
              </span>
              {isLatest && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-600 rounded-full border border-blue-200">
                  Current
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">Build</div>
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

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500">
              {formatTimeAgo(createdAt)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-700">
              {duration || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
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
                      {build_id.slice(0, 8)}
                    </span>
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{build_id}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 font-normal">Build</span>
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

        <div className="col-span-4 flex flex-col justify-center min-w-0">
          <span className="text-sm text-gray-500 mt-1 pl-6">
            {duration || "—"}
          </span>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-4 min-w-0">
          <div className="flex flex-col items-end min-w-0">
            <span className="text-sm text-gray-700 whitespace-nowrap font-[450]">
              {formatTimeAgo(createdAt)}
            </span>
          </div>

          {dropdownActions && dropdownActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
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

export const BuildItemRowSkeleton = () => (
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
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="col-span-2 space-y-2">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-12 ml-6" />
      </div>
      <div className="col-span-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="col-span-3 flex justify-end">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </div>
)
