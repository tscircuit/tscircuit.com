import type * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageDeployment = (
  internal_package_deployment: ZT.PackageDeployment,
): ZT.PublicPackageDeployment => {
  return {
    package_deployment_id: internal_package_deployment.package_deployment_id,
    package_release_id: internal_package_deployment.package_release_id,
    package_build_id: internal_package_deployment.package_build_id,
    default_main_component_path:
      internal_package_deployment.default_main_component_path ?? null,
    fully_qualified_domain_name:
      internal_package_deployment.fully_qualified_domain_name ?? null,
    created_at: internal_package_deployment.created_at.toISOString(),
  }
}
