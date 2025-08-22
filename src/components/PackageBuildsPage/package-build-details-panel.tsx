import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useNow } from "@/hooks/use-now"
import { timeAgo } from "@/lib/utils/timeAgo"
import { PackageRelease } from "fake-snippets-api/lib/db/schema"
import { Clock, GitBranch, GitCommit, Globe, User } from "lucide-react"
import { useParams, Link } from "wouter"

const capitalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getColorFromDisplayStatus(
  display_status: PackageRelease["display_status"],
) {
  switch (display_status) {
    case "pending":
      return "bg-yellow-500"
    case "building":
      return "bg-blue-500"
    case "complete":
      return "bg-green-500"
    case "error":
      return "bg-red-500"
  }
}

export function PackageBuildDetailsPanel() {
  const { packageRelease } = useCurrentPackageRelease({ refetchInterval: 2000 })
  const { author } = useParams() // TODO use packageRelease.author_account_id when it's added by backed
  const now = useNow(1000)

  if (!packageRelease) {
    // TODO show skeleton instead
    return null
  }

  const {
    circuit_json_build_display_status,
    circuit_json_build_in_progress,
    circuit_json_build_is_stale,
    circuit_json_build_logs,
    transpilation_display_status,
    transpilation_in_progress,
    transpilation_logs,
    circuit_json_build_completed_at,
    transpilation_is_stale,
    display_status,
    created_at,
    has_transpiled,
    circuit_json_build_started_at,
    circuit_json_build_error,
    circuit_json_build_error_last_updated_at,
    total_build_duration_ms,
    transpilation_completed_at,
    transpilation_error,
    transpilation_started_at,
    commit_sha,
  } = packageRelease

  const buildStartedAt = (() => {
    if (transpilation_started_at && circuit_json_build_started_at) {
      return new Date(transpilation_started_at) <
        new Date(circuit_json_build_started_at)
        ? transpilation_started_at
        : circuit_json_build_started_at
    }
    return transpilation_started_at || circuit_json_build_started_at || null
  })()

  const buildCompletedAt =
    circuit_json_build_completed_at || transpilation_completed_at || null

  const elapsedMs = buildStartedAt
    ? (buildCompletedAt ? new Date(buildCompletedAt).getTime() : now) -
      new Date(buildStartedAt).getTime()
    : null

  return (
    <div className="space-y-4 sm:space-y-6 bg-white p-3 sm:p-4 border border-gray-200 rounded-lg">
      {/* Created */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/${author}`}
            className="flex items-center gap-2 hover:underline min-w-0"
          >
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm truncate">{author}</span>
          </Link>
          <span className="text-sm text-gray-500 flex-shrink-0">
            {timeAgo(created_at, "")}
          </span>
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 ${getColorFromDisplayStatus(display_status)} rounded-full flex-shrink-0`}
          ></div>
          <span className="text-sm">{capitalCase(display_status)}</span>
          {/* <Badge
            variant="secondary"
            className="bg-gray-200 text-gray-700 text-xs"
          >
            Latest
          </Badge> */}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Build Time</h3>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {elapsedMs !== null && (
            <span className="text-sm flex-shrink-0">
              {Math.floor(elapsedMs / 1000)}s
            </span>
          )}
          <span className="text-sm text-gray-500 truncate">
            {buildStartedAt
              ? `Started ${timeAgo(buildStartedAt)}`
              : "waiting..."}
          </span>
        </div>
      </div>

      {/* Version */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Version</h3>
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm break-all">{packageRelease.version}</span>
          {/* <Badge variant="default" className="bg-blue-600 text-white text-xs">
            Current
          </Badge> */}
        </div>
      </div>

      {/* Outputs */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Outputs</h3>
        <div>
          <span className="text-sm text-gray-400">None</span>
        </div>
      </div>

      {/* Source */}
      {/* <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Source</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-500" />
            <span className="text-sm">main</span>
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              edfdc67 support empty file creation (#356)
            </span>
          </div>
        </div>
      </div> */}
    </div>
  )
}
