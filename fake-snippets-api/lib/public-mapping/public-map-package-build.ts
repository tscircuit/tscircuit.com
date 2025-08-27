import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageBuild = (
  internalPackageBuild: ZT.PackageBuild,
  options: {
    include_logs?: boolean
  } = {
    include_logs: false,
  },
): ZT.PackageBuild => {
  const result = {
    ...internalPackageBuild,
    created_at: internalPackageBuild.created_at,
    transpilation_started_at: internalPackageBuild.transpilation_started_at,
    transpilation_completed_at: internalPackageBuild.transpilation_completed_at,
    transpilation_logs: options.include_logs
      ? internalPackageBuild.transpilation_logs
      : [],
    transpilation_error: internalPackageBuild.transpilation_error,
    circuit_json_build_started_at:
      internalPackageBuild.circuit_json_build_started_at,
    circuit_json_build_completed_at:
      internalPackageBuild.circuit_json_build_completed_at,
    circuit_json_build_logs: options.include_logs
      ? internalPackageBuild.circuit_json_build_logs
      : [],
    circuit_json_build_error: internalPackageBuild.circuit_json_build_error,
    image_generation_in_progress:
      internalPackageBuild.image_generation_in_progress,
    image_generation_started_at:
      internalPackageBuild.image_generation_started_at,
    image_generation_completed_at:
      internalPackageBuild.image_generation_completed_at,
    image_generation_logs: options.include_logs
      ? internalPackageBuild.image_generation_logs
      : [],
    image_generation_error: internalPackageBuild.image_generation_error,
    build_started_at: internalPackageBuild.build_started_at,
    build_completed_at: internalPackageBuild.build_completed_at,
    build_error: internalPackageBuild.build_error,
    build_error_last_updated_at:
      internalPackageBuild.build_error_last_updated_at,
    preview_url: internalPackageBuild.preview_url,
    build_logs: options.include_logs ? internalPackageBuild.build_logs : null,
  }

  return result
}
