import { CheckCircle, XCircle, Loader2, Hourglass } from "lucide-react"
import { Link, useParams } from "wouter"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BuildStatusBadgeProps {
  packageRelease: PackageRelease
}

const statusConfig = {
  complete: {
    icon: CheckCircle,
    text: "Build successful",
    className: "text-green-600 dark:text-green-500",
  },
  error: {
    icon: XCircle,
    text: "Build failed",
    className: "text-red-600 dark:text-red-500",
  },
  building: {
    icon: Loader2,
    text: "Build in progress",
    className: "text-yellow-600 dark:text-yellow-500 animate-spin",
  },
  pending: {
    icon: Hourglass,
    text: "Build pending",
    className: "text-gray-500 dark:text-gray-400",
  },
} as const

export const BuildStatusBadge = ({ packageRelease }: BuildStatusBadgeProps) => {
  const { author, packageName } = useParams()
  const href = `/${author}/${packageName}/releases/${packageRelease.package_release_id}`
  const status = packageRelease.display_status ?? "pending"
  const config = statusConfig[status] ?? statusConfig.pending
  const Icon = config.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className="inline-flex items-center gap-1 py-0.5 px-1.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <Icon className={`h-4 w-4 ${config.className}`} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
