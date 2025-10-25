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
  PackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useSSELogStream } from "@/hooks/use-sse-log-stream"

export const ConnectedRepoOverview = ({
  packageBuild,
  pkg,
  isLoadingBuild,
  packageRelease,
}: {
  packageBuild?: PackageBuild | null
  isLoadingBuild: boolean
  pkg: Package
  packageRelease: PackageRelease
}) => {
  const { status, label } = getBuildStatus(packageBuild ?? null)
  const [openSections, setOpenSections] = useState({
    transpilation: false,
    userCode: false,
    circuitJson: false,
    imageGeneration: false,
  })
  const logsEndRef = useRef<HTMLDivElement | null>(null)

  const userCodeJobInProgress = Boolean(
    packageRelease.user_code_started_at &&
      !packageRelease.user_code_completed_at &&
      !packageRelease.user_code_error,
  )

  // Use custom hook to manage SSE log streaming
  const { streamedLogs: usercodeStreamedLogs } = useSSELogStream(
    packageRelease.user_code_log_stream_url,
    userCodeJobInProgress,
    packageRelease.package_release_id,
  )

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (
      logsEndRef.current &&
      userCodeJobInProgress &&
      usercodeStreamedLogs.length > 0
    ) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [usercodeStreamedLogs, userCodeJobInProgress])

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
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600">
            No build information available.
          </p>
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
    const transpilationDuration = packageBuild?.transpilation_started_at
      ? Math.floor(
          (new Date(
            packageBuild.transpilation_completed_at || new Date(),
          ).getTime() -
            new Date(packageBuild.transpilation_started_at).getTime()) /
            1000,
        )
      : 0

    const userCodeDuration = packageRelease?.user_code_started_at
      ? Math.floor(
          (new Date(
            packageRelease.user_code_completed_at || new Date(),
          ).getTime() -
            new Date(packageRelease.user_code_started_at).getTime()) /
            1000,
        )
      : 0

    const circuitJsonDuration = packageBuild?.circuit_json_build_started_at
      ? Math.floor(
          (new Date(
            packageBuild.circuit_json_build_completed_at || new Date(),
          ).getTime() -
            new Date(packageBuild.circuit_json_build_started_at).getTime()) /
            1000,
        )
      : 0
    const imageGenerationDuration = packageBuild?.image_generation_started_at
      ? Math.floor(
          (new Date(
            packageBuild.image_generation_completed_at || new Date(),
          ).getTime() -
            new Date(packageBuild.image_generation_started_at).getTime()) /
            1000,
        )
      : 0

    if (
      !packageBuild?.transpilation_started_at &&
      !packageRelease?.user_code_started_at &&
      !packageBuild?.circuit_json_build_started_at &&
      !packageBuild?.image_generation_started_at
    ) {
      return null
    }

    return (
      transpilationDuration +
      userCodeDuration +
      circuitJsonDuration +
      imageGenerationDuration
    )
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
                      : `https://github.com/${pkg.github_repo_full_name}/tree/${packageRelease?.branch_name || "main"}`
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
                      : packageRelease?.branch_name || "main"}
                  </Badge>
                </a>
              </div>
            </div>

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
                  title={`Build started at ${packageBuild.build_started_at}`}
                >
                  {buildDuration || 0}s
                </p>
              </div>
            </div>
          </div>

          {packageRelease?.commit_message && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Commit Message
              </p>
              <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">
                {packageRelease?.commit_message}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Latest Build Logs
          </h2>
          <a
            href={`/${pkg.name.split("/")[0]}/${pkg.name.split("/")[1]}/releases/${packageRelease.package_release_id}/builds`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            (previous builds)
          </a>
        </div>

        <Collapsible
          open={openSections.transpilation}
          onOpenChange={() => toggleSection("transpilation")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.transpilation ? "rotate-90" : ""}`}
                />
                {packageBuild.transpilation_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageBuild.transpilation_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : packageBuild.transpilation_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Transpilation</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  packageBuild.transpilation_started_at,
                  packageBuild.transpilation_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      packageBuild.transpilation_started_at,
                      packageBuild.transpilation_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      packageBuild.transpilation_error,
                      packageBuild.transpilation_completed_at,
                      packageBuild.transpilation_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            packageBuild.transpilation_error,
                            packageBuild.transpilation_completed_at,
                            packageBuild.transpilation_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {packageBuild.transpilation_error
                    ? "Failed"
                    : packageBuild.transpilation_completed_at
                      ? "Completed"
                      : packageBuild.transpilation_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {packageBuild.transpilation_error && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong>{" "}
                    {getErrorMessage(packageBuild.transpilation_error)}
                  </div>
                )}
                {packageBuild.transpilation_logs &&
                packageBuild.transpilation_logs.length > 0 ? (
                  packageBuild.transpilation_logs.map((log: any, i: number) => (
                    <div key={i} className="text-gray-600 whitespace-pre-wrap">
                      {log.msg || log.message || JSON.stringify(log)}
                    </div>
                  ))
                ) : !packageBuild.transpilation_error ? (
                  <div className="text-gray-500">No logs available</div>
                ) : null}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.userCode}
          onOpenChange={() => toggleSection("userCode")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.userCode ? "rotate-90" : ""}`}
                />
                {packageRelease.user_code_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageRelease.user_code_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : userCodeJobInProgress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Usercode Logs</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  packageRelease.user_code_started_at,
                  packageRelease.user_code_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      packageRelease.user_code_started_at,
                      packageRelease.user_code_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      packageRelease.user_code_error,
                      packageRelease.user_code_completed_at,
                      userCodeJobInProgress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            packageRelease.user_code_error,
                            packageRelease.user_code_completed_at,
                            userCodeJobInProgress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {packageRelease.user_code_error
                    ? "Failed"
                    : packageRelease.user_code_completed_at
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
                {packageRelease.user_code_error && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong>{" "}
                    {getErrorMessage(packageRelease.user_code_error)}
                  </div>
                )}
                {userCodeJobInProgress &&
                  packageRelease.user_code_log_stream_url && (
                    <div className="flex items-center gap-2 text-blue-600 mb-3 pb-2 border-b border-blue-200">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">
                        Streaming logs in real-time...
                      </span>
                    </div>
                  )}
                {packageRelease.user_code_build_logs &&
                  packageRelease.user_code_build_logs.length > 0 && (
                    <>
                      {packageRelease.user_code_build_logs.map(
                        (log: any, i: number) => (
                          <div
                            key={`build-log-${i}`}
                            className="text-gray-600 whitespace-pre-wrap"
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
                        className="text-gray-600 whitespace-pre-wrap"
                      >
                        {log}
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </>
                )}
                {packageRelease.user_code_build_logs?.length === 0 &&
                  usercodeStreamedLogs.length === 0 &&
                  !packageRelease.user_code_error &&
                  !userCodeJobInProgress && (
                    <div className="text-gray-500">No logs available</div>
                  )}
                {packageRelease.user_code_log_stream_url &&
                  !userCodeJobInProgress && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <a
                        href={packageRelease.user_code_log_stream_url}
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

        <Collapsible
          open={openSections.circuitJson}
          onOpenChange={() => toggleSection("circuitJson")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.circuitJson ? "rotate-90" : ""}`}
                />
                {packageBuild.circuit_json_build_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageBuild.circuit_json_build_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : packageBuild.circuit_json_build_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Circuit JSON Build</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  packageBuild.circuit_json_build_started_at,
                  packageBuild.circuit_json_build_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      packageBuild.circuit_json_build_started_at,
                      packageBuild.circuit_json_build_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      packageBuild.circuit_json_build_error,
                      packageBuild.circuit_json_build_completed_at,
                      packageBuild.circuit_json_build_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            packageBuild.circuit_json_build_error,
                            packageBuild.circuit_json_build_completed_at,
                            packageBuild.circuit_json_build_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {packageBuild.circuit_json_build_error
                    ? "Failed"
                    : packageBuild.circuit_json_build_completed_at
                      ? "Completed"
                      : packageBuild.circuit_json_build_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {packageBuild.circuit_json_build_error && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong>{" "}
                    {getErrorMessage(packageBuild.circuit_json_build_error)}
                  </div>
                )}
                {packageBuild.circuit_json_build_logs &&
                packageBuild.circuit_json_build_logs.length > 0 ? (
                  packageBuild.circuit_json_build_logs.map(
                    (log: any, i: number) => (
                      <div
                        key={i}
                        className="text-gray-600 whitespace-pre-wrap"
                      >
                        {log.msg || log.message || JSON.stringify(log)}
                      </div>
                    ),
                  )
                ) : !packageBuild.circuit_json_build_error ? (
                  <div className="text-gray-500">No logs available</div>
                ) : null}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.imageGeneration}
          onOpenChange={() => toggleSection("imageGeneration")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.imageGeneration ? "rotate-90" : ""}`}
                />
                {packageBuild.image_generation_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageBuild.image_generation_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : packageBuild.image_generation_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Image Generation</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  packageBuild.image_generation_started_at,
                  packageBuild.image_generation_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      packageBuild.image_generation_started_at,
                      packageBuild.image_generation_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      packageBuild.image_generation_error,
                      packageBuild.image_generation_completed_at,
                      packageBuild.image_generation_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            packageBuild.image_generation_error,
                            packageBuild.image_generation_completed_at,
                            packageBuild.image_generation_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {packageBuild.image_generation_error
                    ? "Failed"
                    : packageBuild.image_generation_completed_at
                      ? "Completed"
                      : packageBuild.image_generation_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {packageBuild.image_generation_error && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong>{" "}
                    {getErrorMessage(packageBuild.image_generation_error)}
                  </div>
                )}
                {packageBuild.image_generation_logs &&
                packageBuild.image_generation_logs.length > 0 ? (
                  packageBuild.image_generation_logs.map(
                    (log: any, i: number) => (
                      <div
                        key={i}
                        className="text-gray-600 whitespace-pre-wrap"
                      >
                        {log.msg || log.message || JSON.stringify(log)}
                      </div>
                    ),
                  )
                ) : !packageBuild.image_generation_error ? (
                  <div className="text-gray-500">No logs available</div>
                ) : null}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
