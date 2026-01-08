import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  User,
  Hash,
  GitCommit,
  PackageOpen,
  RefreshCw,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getBuildStatus, StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import {
  Package,
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useSSELogStream } from "@/hooks/use-sse-log-stream"
import { Link } from "wouter"

export const ConnectedRepoOverview = ({
  packageBuild,
  pkg,
  isLoadingBuild,
  packageRelease,
}: {
  packageBuild?: PackageBuild | null
  isLoadingBuild: boolean
  pkg: Package
  packageRelease: PublicPackageRelease
}) => {
  const { status, label } = getBuildStatus(packageBuild)
  const [openSections, setOpenSections] = useState({
    userCode: true,
  })
  const logsEndRef = useRef<HTMLDivElement | null>(null)

  const userCodeJobInProgress = Boolean(
    packageRelease.user_code_job_started_at &&
      !packageRelease.user_code_job_completed_at &&
      !packageRelease.user_code_job_error,
  )

  // Use custom hook to manage SSE log streaming
  const { streamedLogs: usercodeStreamedLogs } = useSSELogStream(
    packageRelease.user_code_job_log_stream_url,
    userCodeJobInProgress,
    packageRelease.package_release_id,
  )

  // Auto-scroll to bottom when new logs arrive (only if section is open)
  useEffect(() => {
    if (
      logsEndRef.current &&
      userCodeJobInProgress &&
      usercodeStreamedLogs.length > 0 &&
      openSections.userCode
    ) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [usercodeStreamedLogs, userCodeJobInProgress, openSections.userCode])

  // Gracefully handle when there is no build yet
  if (isLoadingBuild) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none">
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-24 h-9 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!packageBuild) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                No build available
              </h3>
              <p className="text-sm text-gray-600 max-w-md">
                This package release hasn't been built yet. Click the{" "}
                <span className="inline-flex items-center gap-1 font-medium text-gray-700">
                  <RefreshCw className="w-3 h-3" />
                  Rebuild
                </span>{" "}
                button above to start a build.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getErrorMessage = (error: any): string => {
    if (!error) return ""
    if (typeof error === "string") return error
    if (typeof error === "object") {
      return error.message || JSON.stringify(error)
    }
    return String(error)
  }

  const buildDuration = (() => {
    const userCodeJobDuration = packageBuild?.user_code_job_started_at
      ? Math.floor(
          (new Date(
            packageBuild.user_code_job_completed_at || new Date(),
          ).getTime() -
            new Date(packageBuild.user_code_job_started_at).getTime()) /
            1000,
        )
      : 0

    if (!packageBuild?.user_code_job_started_at) {
      return null
    }

    return userCodeJobDuration
  })()
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const getStepStatus = (
    error?: string | null,
    completed?: string | null,
    inProgress?: boolean,
  ) => {
    if (error) return "error"
    if (completed) return "success"
    if (inProgress) return "building"
    return "queued"
  }

  const getStepDuration = (
    started?: string | null,
    completed?: string | null,
  ) => {
    if (started && completed) {
      const duration = Math.floor(
        (new Date(completed).getTime() - new Date(started).getTime()) / 1000,
      )
      return `${duration}s`
    }
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 focus:outline-none">
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <StatusIcon status={status} />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Build {label}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <time dateTime={packageBuild.created_at}>
                    Built {formatTimeAgo(packageBuild.created_at)}
                  </time>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {status !== "error" && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 min-w-[80px] h-9"
                  onClick={() =>
                    window.open(
                      `/${pkg.name}/releases/${packageBuild.package_release_id}/preview`,
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 select-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 group">
              <Hash className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Build ID
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(packageBuild.package_build_id)
                    }
                    className="group-hover:text-blue-500 text-xs rounded text-left transition-colors"
                  >
                    {packageBuild.package_build_id}
                  </button>
                </div>
              </div>
            </div>
            {pkg.github_repo_full_name && (
              <div className="flex items-center gap-3 group">
                {packageRelease?.is_pr_preview ? (
                  <GitBranch className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <GitCommit className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {packageRelease?.is_pr_preview ? "PR" : "Branch"}
                  </p>
                  <a
                    href={
                      packageRelease?.is_pr_preview
                        ? `https://github.com/${pkg.github_repo_full_name}/pull/${packageRelease?.github_pr_number}`
                        : `https://github.com/${pkg.github_repo_full_name}/tree/${packageRelease?.github_branch_name || "main"}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {packageRelease?.is_pr_preview
                        ? `#${packageRelease.github_pr_number}`
                        : packageRelease?.github_branch_name || "main"}
                    </Badge>
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 group">
              <User className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Author
                </p>
                <a
                  href={`https://github.com/${pkg.owner_github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-blue-500 transition-colors"
                >
                  {pkg.owner_github_username || "Unknown"}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <Clock className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Duration
                </p>
                <p
                  className="text-sm font-medium hover:text-blue-500 transition-colors cursor-help"
                  title={`Build started at ${packageBuild.user_code_job_started_at}`}
                >
                  {buildDuration !== null ? buildDuration : "N/A"}s
                </p>
              </div>
            </div>
          </div>

          {/* {packageRelease?.commit_message && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Commit Message
              </p>
              <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">
                {packageRelease?.commit_message}
              </p>
            </div>
          )} */}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Build Logs
          </h2>
          <Link
            href={`/${pkg.name.split("/")[0]}/${pkg.name.split("/")[1]}/releases/${packageRelease.package_release_id}/builds`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            (previous builds)
          </Link>
        </div>
        <Collapsible
          open={openSections.userCode}
          onOpenChange={() => toggleSection("userCode")}
        >
          <CollapsibleTrigger asChild>
            <div
              className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${openSections.userCode ? "rounded-b-none border-b-0" : ""}`}
            >
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.userCode ? "rotate-90" : ""}`}
                />
                {packageBuild.user_code_job_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageBuild.user_code_job_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : userCodeJobInProgress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Build Logs</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  packageBuild.user_code_job_started_at,
                  packageBuild.user_code_job_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      packageBuild.user_code_job_started_at,
                      packageBuild.user_code_job_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      packageBuild.user_code_job_error?.message || null,
                      packageBuild.user_code_job_completed_at,
                      userCodeJobInProgress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            packageBuild.user_code_job_error?.message || null,
                            packageBuild.user_code_job_completed_at,
                            userCodeJobInProgress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {packageBuild.user_code_job_error
                    ? "Failed"
                    : packageBuild.user_code_job_completed_at
                      ? "Completed"
                      : userCodeJobInProgress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-2">
                {packageBuild.user_code_job_error && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong>{" "}
                    {getErrorMessage(packageBuild.user_code_job_error)}
                  </div>
                )}
                {userCodeJobInProgress &&
                  packageBuild.user_code_job_log_stream_url && (
                    <div className="flex items-center gap-2 text-blue-600 mb-3 pb-2 border-b border-blue-200">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">
                        Streaming logs in real-time...
                      </span>
                    </div>
                  )}
                {packageBuild.user_code_job_completed_logs &&
                  packageBuild.user_code_job_completed_logs.length > 0 && (
                    <>
                      {packageBuild.user_code_job_completed_logs.map(
                        (log: any, i: number) => (
                          <div
                            key={`build-log-${i}`}
                            className="text-gray-600 whitespace-pre-wrap break-words"
                          >
                            {log.msg || log.message || JSON.stringify(log)}
                          </div>
                        ),
                      )}
                    </>
                  )}
                {usercodeStreamedLogs.length > 0 && (
                  <>
                    {usercodeStreamedLogs.map((log: string, i: number) => (
                      <div
                        key={`streamed-log-${i}`}
                        className="text-gray-600 whitespace-pre-wrap break-words"
                      >
                        {log}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </>
                )}
                {packageBuild.user_code_job_completed_logs?.length === 0 &&
                  usercodeStreamedLogs.length === 0 &&
                  !packageBuild.user_code_job_error &&
                  !userCodeJobInProgress && (
                    <div className="text-gray-500">No logs available</div>
                  )}
                {packageBuild.user_code_job_log_stream_url &&
                  !userCodeJobInProgress && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <a
                        href={packageBuild.user_code_job_log_stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        View raw log stream
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
