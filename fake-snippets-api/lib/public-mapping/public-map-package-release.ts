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
    user_code_build_logs: options.include_logs
      ? internal_package_release.user_code_build_logs
      : null,
    user_code_log_stream_url: options.include_logs
      ? internal_package_release.user_code_log_stream_url
      : null,
    circuit_json_build_logs: options.include_logs
      ? internal_package_release.circuit_json_build_logs
      : [],
    image_generation_logs: options.include_logs
      ? internal_package_release.image_generation_logs
      : null,
    image_generation_in_progress:
      internal_package_release.image_generation_in_progress,
    image_generation_started_at:
      internal_package_release.image_generation_started_at ?? null,
    image_generation_completed_at:
      internal_package_release.image_generation_completed_at ?? null,
    image_generation_is_stale:
      internal_package_release.image_generation_is_stale,
    image_generation_error:
      internal_package_release.image_generation_error ?? null,
    image_generation_error_last_updated_at:
      internal_package_release.image_generation_error_last_updated_at ?? null,
    image_generation_display_status:
      internal_package_release.image_generation_display_status,
    is_pr_preview: Boolean(internal_package_release.is_pr_preview),
    github_pr_number: internal_package_release.github_pr_number,
    branch_name: internal_package_release.branch_name,
    commit_message: internal_package_release.commit_message ?? null,
    commit_author: internal_package_release.commit_author ?? null,
    pcb_preview_image_url:
      internal_package_release.pcb_preview_image_url ?? null,
    sch_preview_image_url:
      internal_package_release.sch_preview_image_url ?? null,
    cad_preview_image_url:
      internal_package_release.cad_preview_image_url ?? null,
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
