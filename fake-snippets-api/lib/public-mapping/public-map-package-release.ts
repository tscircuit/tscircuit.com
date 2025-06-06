import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageRelease = (
  internal_package_release: ZT.PackageRelease,
  options: {
    include_logs?: boolean
  } = {
    include_logs: false,
  },
): ZT.PackageRelease => {
  return {
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
}
