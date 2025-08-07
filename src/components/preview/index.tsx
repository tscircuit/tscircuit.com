export { ConnectedRepoOverview } from "./ConnectedRepoOverview"
export { BuildsList } from "./BuildsList"
export { PackageReleasesDashboard } from "./PackageReleasesDashboard"
import {
  Package,
  PackageBuild,
  PackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
export const getBuildStatus = (build: PackageBuild | null) => {
  if (!build) {
    return { status: "pending", label: "No builds" }
  }
  if (
    build?.build_error ||
    build?.transpilation_error ||
    build?.circuit_json_build_error
  ) {
    return { status: "error", label: "Failed" }
  }
  if (
    build?.build_in_progress ||
    build?.transpilation_in_progress ||
    build?.circuit_json_build_in_progress
  ) {
    return { status: "building", label: "Building" }
  }
  if (build?.build_completed_at && build?.transpilation_completed_at) {
    return { status: "success", label: "Ready" }
  }
  return { status: "queued", label: "Queued" }
}

export const MOCK_PACKAGE_BUILDS: PackageBuild[] = [
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

export const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "building":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

export const getLatestBuildForPackage = (pkg: Package): PackageBuild => {
  return MOCK_PACKAGE_BUILDS[0]
}
