import { useMemo } from "react"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"
import { getCircuitDiagnosticCounts } from "@/lib/get-circuit-diagnostic-counts"
import { Link, useParams } from "wouter"
import type { PublicPackageRelease } from "fake-snippets-api/lib/db/schema"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePackageBuild } from "@/hooks/use-package-builds"
import { getBuildStatus, StatusIcon } from "@/components/preview"

interface BuildStatusBadgeProps {
  packageRelease: PublicPackageRelease
}

export const BuildStatusBadge = ({ packageRelease }: BuildStatusBadgeProps) => {
  const { author, packageName } = useParams()
  const { data: build } = usePackageBuild(
    packageRelease.latest_package_build_id ?? null,
  )
  const { status, label } = getBuildStatus(build)
  const { circuitJson, isLoading, error } = useCurrentPackageCircuitJson()
  const counts = useMemo(
    () => getCircuitDiagnosticCounts(circuitJson),
    [circuitJson],
  )
  const hasErrors = counts.errors > 0
  const count = hasErrors ? counts.errors : counts.warnings
  const kind = hasErrors ? "errors" : "warnings"
  const Icon = hasErrors ? AlertCircle : AlertTriangle

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-1">
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
        {!isLoading && !error && circuitJson && (
          <Link
            href={`/${author}/${packageName}/releases/${packageRelease.package_release_id}/preview?tab=errors`}
            title={`${count} ${kind} — view circuit diagnostics`}
            aria-label={`View ${count} circuit ${kind}`}
            className={`inline-flex items-center gap-1 py-0.5 px-1 text-xs leading-4 rounded hover:underline focus-visible:outline-none focus-visible:ring-2 ${hasErrors ? "text-red-600 dark:text-red-400 focus-visible:ring-red-500" : "text-amber-600 dark:text-amber-400 focus-visible:ring-amber-500"}`}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span className="tabular-nums">{count}</span>
          </Link>
        )}
      </div>
    </TooltipProvider>
  )
}
