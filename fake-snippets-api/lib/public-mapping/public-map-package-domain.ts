import type * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackageDomain = (
  internal_package_domain: ZT.PackageDomain,
): ZT.PublicPackageDomain => {
  return {
    package_domain_id: internal_package_domain.package_domain_id,
    package_release_id: internal_package_domain.package_release_id ?? null,
    package_build_id: internal_package_domain.package_build_id ?? null,
    package_id: internal_package_domain.package_id ?? null,
    points_to: internal_package_domain.points_to,
    tag: internal_package_domain.tag ?? null,
    default_main_component_path:
      internal_package_domain.default_main_component_path ?? null,
    fully_qualified_domain_name:
      internal_package_domain.fully_qualified_domain_name ?? null,
    created_at: internal_package_domain.created_at.toISOString(),
  }
}
