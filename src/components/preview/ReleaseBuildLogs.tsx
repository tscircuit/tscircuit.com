import { useState, useEffect, useRef } from "react"
import {
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  PackageOpen,
  CheckCircle2,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { StreamedLogEntry, useSSELogStream } from "@/hooks/use-sse-log-stream"
import { StatusIcon, getBuildErrorMessage, getBuildStatus } from "."
import { getStepDuration } from "@/lib/utils/getStepDuration"

export const ReleaseBuildLogs = ({
  packageBuild,
  isLoadingBuild,
  packageRelease,
  canManagePackage,
  isPollingAfterRebuild = false,
}: {
  packageBuild?: PackageBuild | null
  isLoadingBuild: boolean
  packageRelease: PublicPackageRelease
  canManagePackage: boolean
  isPollingAfterRebuild?: boolean
}) => {
  const [openSections, setOpenSections] = useState({
    userCode: true,
  })
  const logsEndRef = useRef<HTMLDivElement | null>(null)

  const rawBuildStatus = getBuildStatus(packageBuild)
  const isWaitingForBuild =
    isPollingAfterRebuild && rawBuildStatus.status !== "building"
  const userCodeJobInProgress = rawBuildStatus.status === "building"

  const logStreamUrl =
    packageBuild?.user_code_job_log_stream_url ||
    packageRelease.user_code_job_log_stream_url

  const shouldStreamLogs = userCodeJobInProgress

  const sseKey = `${packageBuild?.package_build_id || packageRelease.package_release_id}-${logStreamUrl || "none"}`

  // Use custom hook to manage SSE log streaming
  const { streamedLogs: usercodeStreamedLogs } = useSSELogStream(
    logStreamUrl,
    shouldStreamLogs,
    sseKey,
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const buildStatus = isWaitingForBuild
    ? { status: "queued" as const, label: "Waiting..." }
    : rawBuildStatus
  const buildErrorMessage = getBuildErrorMessage(packageBuild)
  const buildDuration = getStepDuration(
    packageBuild?.user_code_job_started_at,
    packageBuild?.user_code_job_completed_at,
  )

  // Gracefully handle when there is no build yet
  if (isLoadingBuild) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 focus:outline-none">
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!packageBuild) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 border flex items-center justify-center">
              <PackageOpen className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                No build available
              </h3>
              <p className="text-sm text-gray-600 max-w-md">
                This package release hasn't been built yet.
                <br />
                {canManagePackage && (
                  <>Click the Rebuild button above to start a build.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 focus:outline-none">
      <div className="space-y-3">
        <Collapsible
          open={openSections.userCode}
          onOpenChange={() => toggleSection("userCode")}
          className="border border-gray-200 rounded-lg bg-white overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex  select-none items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors data-[state=open]:border-b data-[state=open]:border-gray-200">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 text-gray-500 transition-all ${
                    openSections.userCode ? "rotate-90" : ""
                  }`}
                />
                <span className="font-medium text-gray-900 select-none">
                  Build Logs
                </span>
              </div>
              <div className="flex items-center gap-2">
                {buildDuration && (
                  <span className="text-sm text-gray-600">{buildDuration}</span>
                )}
                <StatusIcon size={5} status={buildStatus.status} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 bg-gray-50/50">
              <div className="font-mono text-xs space-y-2">
                {buildErrorMessage && (
                  <div className="text-red-600 whitespace-pre-wrap mb-4">
                    <strong>Error:</strong> {buildErrorMessage}
                  </div>
                )}
                {isWaitingForBuild && !userCodeJobInProgress && (
                  <div className="flex items-center gap-2 text-amber-600 mb-3 pb-2 border-b border-amber-200">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span className="text-xs font-medium">
                      Waiting for build to start...
                    </span>
                  </div>
                )}
                {userCodeJobInProgress &&
                  packageBuild?.user_code_job_log_stream_url && (
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
                    {usercodeStreamedLogs.map((log: StreamedLogEntry, i: number) => (
                      <div
                        key={`streamed-log-${i}`}
                        className={`whitespace-pre-wrap break-words ${
                          log.eventType === "stderr"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {log.message}
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
