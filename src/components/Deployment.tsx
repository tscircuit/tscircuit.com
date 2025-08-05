import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Loader2,
  Rocket,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PrefetchPageLink } from "./PrefetchPageLink"

interface PackageBuild {
  package_build_id: string
  package_release_id: string | null
  created_at: string
  transpilation_in_progress: boolean
  transpilation_started_at: string | null
  transpilation_completed_at: string | null
  transpilation_logs: any[]
  transpilation_error: string | null
  circuit_json_build_in_progress: boolean
  circuit_json_build_started_at: string | null
  circuit_json_build_completed_at: string | null
  circuit_json_build_logs: any[]
  circuit_json_build_error: string | null
  build_in_progress: boolean
  build_started_at: string | null
  build_completed_at: string | null
  build_error: string | null
  build_error_last_updated_at: string
  preview_url: string | null
  build_logs: string | null
  branch_name: string | null
  commit_message: string | null
  commit_author: string | null
}

interface DeploymentCardProps {
  deployment: PackageBuild
  className?: string
}

export const MOCK_DEPLOYMENTS: PackageBuild[] = [
  {
    package_build_id: "pb_1a2b3c4d",
    package_release_id: "pr_5e6f7g8h",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 35,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 32,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 30,
    ).toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    build_completed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 25,
    ).toISOString(),
    build_logs: null,
    preview_url: "https://preview.tscircuit.com/pb_1a2b3c4d",
    branch_name: "main",
    commit_message: "Add new LED component with improved brightness control",
    commit_author: "john.doe",
  },
  {
    package_build_id: "pb_9i8j7k6l",
    package_release_id: "pr_5m4n3o2p",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 60 * 2,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 3,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: true,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 5,
    ).toISOString(),
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: null,
    build_completed_at: null,
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 60 * 2,
    ).toISOString(),
    build_logs: null,
    preview_url: null,
    branch_name: "feature/resistor-update",
    commit_message: "Update resistor component with new tolerance values",
    commit_author: "jane.smith",
  },
  {
    package_build_id: "pb_1q2w3e4r",
    package_release_id: "pr_5t6y7u8i",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 60 * 6,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 6 + 1000 * 60 * 2,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error:
      "TypeScript compilation failed: Cannot find module 'missing-dependency'",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: null,
    build_completed_at: null,
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 60 * 6,
    ).toISOString(),
    build_logs: null,
    preview_url: null,
    branch_name: "hotfix/critical-bug",
    commit_message: "Fix critical issue with capacitor placement",
    commit_author: "alex.wilson",
  },
  {
    package_build_id: "pb_9o8i7u6y",
    package_release_id: "pr_5t4r3e2w",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24,
    ).toISOString(),
    transpilation_completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 4,
    ).toISOString(),
    transpilation_logs: [],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 4,
    ).toISOString(),
    circuit_json_build_completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 8,
    ).toISOString(),
    circuit_json_build_logs: [],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 8,
    ).toISOString(),
    build_completed_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 12,
    ).toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date(
      Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 12,
    ).toISOString(),
    build_logs: null,
    preview_url: "https://preview.tscircuit.com/pb_9o8i7u6y",
    branch_name: "main",
    commit_message: "Initial project setup with basic components",
    commit_author: "sarah.johnson",
  },
]

const getDeploymentStatus = (deployment: PackageBuild) => {
  if (
    deployment.build_error ||
    deployment.transpilation_error ||
    deployment.circuit_json_build_error
  ) {
    return { status: "failed", label: "Failed" }
  }
  if (
    deployment.build_in_progress ||
    deployment.transpilation_in_progress ||
    deployment.circuit_json_build_in_progress
  ) {
    return { status: "building", label: "Building" }
  }
  if (deployment.build_completed_at && deployment.transpilation_completed_at) {
    return { status: "success", label: "Ready" }
  }
  return { status: "pending", label: "Pending" }
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />
    case "failed":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "building":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({
  deployment,
  className,
}) => {
  const { status, label } = getDeploymentStatus(deployment)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "border border-gray-200",
        "hover:border-gray-300",
        "bg-white",
        "p-6",
        "flex flex-col",
        "min-h-[200px]",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            tsc-deploy
          </a>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant={
              status === "success"
                ? "default"
                : status === "error"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs flex items-center"
          >
            {label}
          </Badge>
          <div className="flex items-center justify-center">
            <StatusIcon status={status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Github className="w-4 h-4 text-gray-600" />
        <a
          href="https://github.com/ArnavK-09/tsc-deploy"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          ArnavK-09/tsc-deploy
        </a>
      </div>

      {deployment.commit_message && (
        <div className="mb-6 flex-1">
          <h4 className="text-sm font-medium truncate text-gray-900 mb-2">
            {deployment.commit_message}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatTimeAgo(deployment.created_at)} on</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                {deployment.branch_name || "main"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 w-full mt-auto">
        <PrefetchPageLink
          className="w-full"
          href={`/deployment/${deployment.package_build_id}`}
        >
          <Button
            size="sm"
            className="bg-blue-600 w-full hover:bg-blue-700 text-white px-4 py-2"
          >
            View Deployment
          </Button>
        </PrefetchPageLink>
        {deployment.preview_url && status === "success" && (
          <PrefetchPageLink
            className="w-full"
            href={`/deployment/${deployment.package_build_id}/preview`}
          >
            <Button size="sm" variant="outline" className="px-4 py-2 w-full">
              Preview
            </Button>
          </PrefetchPageLink>
        )}
      </div>
    </Card>
  )
}

export const DeploymentCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-gray-200 rounded" />
          <div className="flex-1 h-8 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export const DeploymentsContent = ({ user }: { user: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [deployments, setDeployments] = useState(MOCK_DEPLOYMENTS)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <DeploymentCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (deployments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-black">
        <Rocket className="w-12 h-12 mb-4 text-black" />
        <h3 className="text-lg font-medium mb-2">No deployments yet</h3>
        <p className="text-sm text-center max-w-md text-gray-800">
          Your github repositories deployments will appear here once you start
          building and deploying your circuits.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {deployments.map((deployment) => (
          <DeploymentCard
            key={deployment.package_build_id}
            deployment={deployment}
          />
        ))}
      </div>
    </div>
  )
}
