import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
  options: {
    include_logs?: boolean
    include_ai_review?: boolean
  } = {
    include_logs: false,
    include_ai_review: false,
  },
): ZT.PackageRelease => {
  const result = {
    ...internal_package_release,
    created_at: internal_package_release.created_at,
    circuit_json_build_error_last_updated_at:
      internal_package_release.circuit_json_build_error_last_updated_at,
    circuit_json_build_error: internal_package_release.circuit_json_build_error,
    transpilation_logs: options.include_logs
      ? internal_package_release.transpilation_logs
      : [],
    circuit_json_build_logs: options.include_logs
      ? internal_package_release.circuit_json_build_logs
      : [],
  }

  // Only include AI review fields when include_ai_review is true
  if (!options.include_ai_review) {
    delete result.ai_review_text
    delete result.ai_review_started_at
    delete result.ai_review_completed_at
    delete result.ai_review_error
    delete result.ai_review_logs
  }

  return result
}
