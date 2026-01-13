import { useState, useEffect, useRef } from "react"
import {
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  PackageOpen,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Package,
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { useSSELogStream } from "@/hooks/use-sse-log-stream"

export const ReleaseBuildLogs = ({
  packageBuild,
  isLoadingBuild,
  packageRelease,
}: {
  packageBuild?: PackageBuild | null
  isLoadingBuild: boolean
  packageRelease: PublicPackageRelease
}) => {
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

  const getErrorMessage = (error: any): string => {
    if (!error) return ""
    if (typeof error === "string") return error
    if (typeof error === "object") {
      return error.message || JSON.stringify(error)
    }
    return String(error)
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 focus:outline-none">
      <div className="space-y-3">
        <Collapsible
          open={openSections.userCode}
          onOpenChange={() => toggleSection("userCode")}
          className="border border-gray-200 rounded-lg bg-white overflow-hidden"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors data-[state=open]:border-b data-[state=open]:border-gray-200">
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
                {packageBuild.user_code_job_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : packageBuild.user_code_job_completed_at ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : userCodeJobInProgress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 bg-gray-50/50">
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
