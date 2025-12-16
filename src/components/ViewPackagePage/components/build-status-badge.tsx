import { Link, useParams } from "wouter"
import type { PackageRelease } from "fake-snippets-api/lib/db/schema"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { getBuildStatus, StatusIcon } from "@/components/preview"

interface BuildStatusBadgeProps {
  packageRelease: PackageRelease
}

export const BuildStatusBadge = ({ packageRelease }: BuildStatusBadgeProps) => {
  const { author, packageName } = useParams()
  const { data: build } = usePackageBuild(
    packageRelease.latest_package_build_id ?? null,
  )
  const { status, label } = getBuildStatus(build)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/${author}/${packageName}/releases/${packageRelease.package_release_id}`}
            className="inline-flex items-center py-0.5 px-1.5 rounded text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <StatusIcon status={status} />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
