import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
): ZT.PackageRelease => {
  return {
    ...internal_package_release,
    display_status: internal_package_release.display_status,
    total_build_duration_ms: internal_package_release.total_build_duration_ms,
    transpilation_display_status: internal_package_release.transpilation_display_status,
    transpilation_in_progress: internal_package_release.transpilation_in_progress,
    transpilation_started_at: internal_package_release.transpilation_started_at,
    transpilation_completed_at: internal_package_release.transpilation_completed_at,
    transpilation_logs: internal_package_release.transpilation_logs,
    transpilation_is_stale: internal_package_release.transpilation_is_stale,
    circuit_json_build_display_status: internal_package_release.circuit_json_build_display_status,
    circuit_json_build_in_progress: internal_package_release.circuit_json_build_in_progress,
    circuit_json_build_started_at: internal_package_release.circuit_json_build_started_at,
    circuit_json_build_completed_at: internal_package_release.circuit_json_build_completed_at,
    circuit_json_build_logs: internal_package_release.circuit_json_build_logs,
    circuit_json_build_is_stale: internal_package_release.circuit_json_build_is_stale,
  }
}
