export { DeploymentOverview } from "./DeploymentOverview"
export { DeploymentsList } from "./DeploymentsList"
export { DeploymentSettings } from "./DeploymentSettings"
export { DeploymentDashboard } from "./DeploymentDashboard"

export const getDeploymentStatus = (deployment: PackageBuild) => {
  if (
    deployment.build_error ||
    deployment.transpilation_error ||
    deployment.circuit_json_build_error
  ) {
    return { status: "error", label: "Failed" }
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
  return { status: "queued", label: "Queued" }
}

export interface PackageBuild {
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
