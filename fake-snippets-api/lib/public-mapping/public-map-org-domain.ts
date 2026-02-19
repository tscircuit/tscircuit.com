import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapOrgDomain = (
  internal_org_domain: ZT.OrgDomain,
  linked_packages: ZT.OrgDomainLinkedPackage[] = [],
): ZT.PublicOrgDomain => {
  return {
    org_domain_id: internal_org_domain.org_domain_id,
    org_id: internal_org_domain.org_id,
    fully_qualified_domain_name:
      internal_org_domain.fully_qualified_domain_name,
    pcm_repository_name: internal_org_domain.pcm_repository_name ?? null,
    points_to: internal_org_domain.points_to,
    created_at: internal_org_domain.created_at.toISOString(),
    linked_packages: linked_packages.map((lp) => ({
      org_domain_linked_package_id: lp.org_domain_linked_package_id,
      org_domain_id: lp.org_domain_id,
      points_to: lp.points_to,
      package_release_id: lp.package_release_id ?? null,
      created_at: lp.created_at.toISOString(),
    })),
  }
}
