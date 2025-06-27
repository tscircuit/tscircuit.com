import * as ZT from "fake-snippets-api/lib/db/schema"
import type { DbClient } from "fake-snippets-api/lib/db/db-client"

export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
  options: {
    include_logs?: boolean
    include_ai_review?: boolean
    db?: DbClient
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

  if (options.include_ai_review && options.db) {
    const reviews = options.db
      .listAiReviews()
      .filter(
        (r) =>
          r.package_release_id === internal_package_release.package_release_id,
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

    if (reviews.length > 0) {
      const latest = reviews[0]
      result.ai_review_text = latest.ai_review_text ?? null
      result.ai_review_started_at = latest.start_processing_at ?? null
      result.ai_review_completed_at = latest.finished_processing_at ?? null
      result.ai_review_error = latest.processing_error ?? null
    }
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
