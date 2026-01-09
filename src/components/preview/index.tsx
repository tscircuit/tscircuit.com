export { ConnectedRepoOverview } from "./ConnectedRepoOverview"
export { BuildsList } from "./BuildsList"
export { PackageReleasesDashboard } from "./PackageReleasesDashboard"
export {
  PackageReleaseOrBuildItemRow,
  PackageReleaseOrBuildItemRowSkeleton,
  formatBuildDuration,
} from "./PackageReleaseOrBuildItemRow"
import { PackageBuild, PackageRelease } from "fake-snippets-api/lib/db/schema"
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export interface DropdownAction {
  label: string
  onClick: (e: React.MouseEvent) => void
  hidden?: boolean
}

export type Status = "pending" | "building" | "success" | "error" | "queued"

export const getBuildStatus = (
  build?: PackageBuild | null,
): {
  status: Status
  label: string
} => {
  if (!build) {
    return { status: "pending", label: "No builds" }
  }

  if (
    build.user_code_job_error &&
    (typeof build.user_code_job_error === "object" ||
      typeof build.user_code_job_error === "string")
  ) {
    return { status: "error", label: "Failed" }
  }

  if (
    build.user_code_job_started_at &&
    !build.user_code_job_completed_at &&
    !build.user_code_job_error
  ) {
    return { status: "building", label: "Building" }
  }

  if (build.user_code_job_completed_at && !build.user_code_job_error) {
    return { status: "success", label: "Ready" }
  }

  if (
    build.user_code_job_started_at &&
    build.user_code_job_completed_at &&
    build.user_code_job_error
  ) {
    return { status: "error", label: "Failed" }
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
  if (
    !build?.build_error &&
    !build?.transpilation_error &&
    !build?.circuit_json_build_error &&
    !build?.build_in_progress &&
    !build?.transpilation_in_progress &&
    !build?.circuit_json_build_in_progress &&
    build?.transpilation_completed_at
  ) {
    return { status: "success", label: "Ready" }
  }
  return { status: "queued", label: "Queued" }
}

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
