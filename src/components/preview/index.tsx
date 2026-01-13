export { ReleaseBuildLogs } from "./ReleaseBuildLogs"
export { BuildsList } from "./BuildsList"
export { ReleasesList } from "./ReleasesList"
export { ReleaseItemRow, ReleaseItemRowSkeleton } from "./ReleaseItemRow"
export { PackageReleasesDashboard } from "./PackageReleasesDashboard"
export {
  PackageReleaseOrBuildItemRow,
  PackageReleaseOrBuildItemRowSkeleton,
  formatBuildDuration,
} from "./PackageReleaseOrBuildItemRow"
import {
  PackageBuild,
  PublicPackageRelease,
} from "fake-snippets-api/lib/db/schema"
import { Clock, AlertCircle, Loader2, CircleCheck } from "lucide-react"

export interface DropdownAction {
  label: string
  onClick: (e: React.MouseEvent) => void
  hidden?: boolean
}

export type Status = "pending" | "building" | "success" | "error" | "queued"

export const getBuildStatus = (
  build?: PackageBuild | PublicPackageRelease | null,
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
  return { status: "queued", label: "Queued" }
}

export const StatusIcon = ({
  status,
  size = 4,
}: { status: Status; size?: number }) => {
  const sizeClasses: Record<number, string> = {
    3: "w-3 h-3",
    4: "w-4 h-4",
    5: "w-5 h-5",
    6: "w-6 h-6",
    8: "w-8 h-8",
    10: "w-10 h-10",
  }
  const sizeClass = sizeClasses[size] || sizeClasses[4]

  switch (status) {
    case "success":
      return <CircleCheck className={`${sizeClass} text-green-500`} />
    case "error":
      return <AlertCircle className={`${sizeClass} text-red-500`} />
    case "building":
      return <Loader2 className={`${sizeClass} text-blue-500 animate-spin`} />
    default:
      return <Clock className={`${sizeClass} text-gray-500`} />
  }
}

export const getBuildErrorMessage = (
  build?: PackageBuild | PublicPackageRelease | null,
): string | null => {
  if (!build) return null

  if (build.user_code_job_error) {
    if (typeof build.user_code_job_error === "string")
      return build.user_code_job_error
    if ((build.user_code_job_error as { message: string }).message)
      return (build.user_code_job_error as { message: string }).message
    return "User code job failed"
  }

  return null
}
