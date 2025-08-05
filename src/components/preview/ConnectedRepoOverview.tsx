import { useState } from "react"
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
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { getBuildStatus, PackageBuild, StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"

interface ConnectedRepoOverviewProps {
  build: PackageBuild
}

export const ConnectedRepoOverview = ({
  build,
}: ConnectedRepoOverviewProps) => {
  const { status, label } = getBuildStatus(build)
  const [openSections, setOpenSections] = useState({
    transpilation: false,
    circuitJson: false,
    finalBuild: false,
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const buildDuration =
    build.build_started_at && build.build_completed_at
      ? Math.floor(
          (new Date(build.build_completed_at).getTime() -
            new Date(build.build_started_at).getTime()) /
            1000,
        )
      : null

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const getStepStatus = (
    error: string | null,
    completed: string | null,
    inProgress: boolean,
  ) => {
    if (error) return "error"
    if (completed) return "success"
    if (inProgress) return "building"
    return "queued"
  }

  const getStepDuration = (
    started: string | null,
    completed: string | null,
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
                    Deployment {label}
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Created {formatTimeAgo(build.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {build.preview_url && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 min-w-[80px] h-9"
                  onClick={() => window.open(build.preview_url!, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                  Preview Deployment
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 group">
              <Hash className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Build ID
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(build.package_build_id)}
                    className="group-hover:text-blue-500 rounded  transition-colors"
                  >
                    {build.package_build_id}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <GitBranch className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Branch
                </p>
                <a
                  href={`https://github.com/tscircuit/tscircuit/tree/${build.branch_name || "main"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Badge
                    variant="outline"
                    className="text-xs mt-1 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    {build.branch_name || "main"}
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
                  href={`https://github.com/${build.commit_author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-blue-500 transition-colors"
                >
                  {build.commit_author || "Unknown"}
                </a>
              </div>
            </div>

            {buildDuration && (
              <div className="flex items-center gap-3 group">
                <Clock className="w-4 h-4 text-gray-500 group-hover:text-blue-500 transition-colors" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Duration
                  </p>
                  <p
                    className="text-sm font-medium hover:text-blue-500 transition-colors cursor-help"
                    title={`Build started at ${build.build_started_at}`}
                  >
                    {buildDuration}s
                  </p>
                </div>
              </div>
            )}
          </div>

          {build.commit_message && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Commit Message
              </p>
              <p className="text-sm text-gray-900 group-hover:text-gray-700 transition-colors">
                {build.commit_message}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Build Steps</h2>

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
                {build.transpilation_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : build.transpilation_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : build.transpilation_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Transpilation</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  build.transpilation_started_at,
                  build.transpilation_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      build.transpilation_started_at,
                      build.transpilation_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      build.transpilation_error,
                      build.transpilation_completed_at,
                      build.transpilation_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            build.transpilation_error,
                            build.transpilation_completed_at,
                            build.transpilation_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {build.transpilation_error
                    ? "Failed"
                    : build.transpilation_completed_at
                      ? "Completed"
                      : build.transpilation_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {build.transpilation_error ? (
                  <div className="text-red-600 whitespace-pre-wrap">
                    {build.transpilation_error}
                  </div>
                ) : build.transpilation_logs &&
                  build.transpilation_logs.length > 0 ? (
                  build.transpilation_logs.map((log: any, i: number) => (
                    <div key={i} className="text-gray-600 whitespace-pre-wrap">
                      {log.msg || log.message || JSON.stringify(log)}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No logs available</div>
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
                {build.circuit_json_build_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : build.circuit_json_build_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : build.circuit_json_build_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Circuit JSON Build</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  build.circuit_json_build_started_at,
                  build.circuit_json_build_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      build.circuit_json_build_started_at,
                      build.circuit_json_build_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      build.circuit_json_build_error,
                      build.circuit_json_build_completed_at,
                      build.circuit_json_build_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            build.circuit_json_build_error,
                            build.circuit_json_build_completed_at,
                            build.circuit_json_build_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {build.circuit_json_build_error
                    ? "Failed"
                    : build.circuit_json_build_completed_at
                      ? "Completed"
                      : build.circuit_json_build_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {build.circuit_json_build_error ? (
                  <div className="text-red-600 whitespace-pre-wrap">
                    {build.circuit_json_build_error}
                  </div>
                ) : build.circuit_json_build_logs &&
                  build.circuit_json_build_logs.length > 0 ? (
                  build.circuit_json_build_logs.map((log: any, i: number) => (
                    <div key={i} className="text-gray-600 whitespace-pre-wrap">
                      {log.msg || log.message || JSON.stringify(log)}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No logs available</div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={openSections.finalBuild}
          onOpenChange={() => toggleSection("finalBuild")}
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${openSections.finalBuild ? "rotate-90" : ""}`}
                />
                {build.build_error ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : build.build_completed_at ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : build.build_in_progress ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Final Build</span>
              </div>
              <div className="flex items-center gap-2">
                {getStepDuration(
                  build.build_started_at,
                  build.build_completed_at,
                ) && (
                  <span className="text-sm text-gray-600">
                    {getStepDuration(
                      build.build_started_at,
                      build.build_completed_at,
                    )}
                  </span>
                )}
                <Badge
                  variant={
                    getStepStatus(
                      build.build_error,
                      build.build_completed_at,
                      build.build_in_progress,
                    ) === "success"
                      ? "default"
                      : getStepStatus(
                            build.build_error,
                            build.build_completed_at,
                            build.build_in_progress,
                          ) === "error"
                        ? "destructive"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {build.build_error
                    ? "Failed"
                    : build.build_completed_at
                      ? "Completed"
                      : build.build_in_progress
                        ? "Running"
                        : "Queued"}
                </Badge>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-white border-x border-b border-gray-200 rounded-b-lg p-4">
              <div className="font-mono text-xs space-y-1">
                {build.build_error ? (
                  <div className="text-red-600 whitespace-pre-wrap">
                    {build.build_error}
                  </div>
                ) : build.build_logs ? (
                  <div className="text-gray-600 whitespace-pre-wrap">
                    {build.build_logs}
                  </div>
                ) : (
                  <div className="text-gray-500">No logs available</div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
