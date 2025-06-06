import { Globe, Clock } from "lucide-react"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useParams } from "wouter"
import { timeAgo } from "@/lib/utils/timeAgo"
import { PackageRelease } from "fake-snippets-api/lib/db/schema"

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
  const { packageRelease } = useCurrentPackageRelease()
  const { author } = useParams() // TODO use packageRelease.author_account_id when it's added by backed

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

  return (
    <div className="space-y-6 bg-white p-4 border border-gray-200 rounded-lg">
      {/* Created */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
            I
          </div>
          <span className="text-sm">{author}</span>
          <span className="text-sm text-gray-500">
            {timeAgo(packageRelease?.created_at, "")}
          </span>
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 ${getColorFromDisplayStatus(display_status)} rounded-full`}
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
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          {circuit_json_build_completed_at && (
            <span className="text-sm">
              {total_build_duration_ms
                ? `${Math.floor(total_build_duration_ms / 1000)}s`
                : ""}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {timeAgo(circuit_json_build_completed_at, "waiting...")}
          </span>
        </div>
      </div>

      {/* Version */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Version</h3>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{packageRelease.version}</span>
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
