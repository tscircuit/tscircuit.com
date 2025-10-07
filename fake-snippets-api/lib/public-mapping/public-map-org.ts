import { z } from "zod"
import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapOrg = (
  internal_org: ZT.Organization & {
    member_count: number
    package_count: number
    can_manage_org: boolean
  },
): z.infer<typeof ZT.publicOrgSchema> => {
  const {
    can_manage_org,
    github_handle,
    member_count,
    package_count,
    created_at,
    is_personal_org,
    org_display_name,
    org_name,
    ...org
  } = internal_org
  return {
    org_id: org.org_id,
    display_name: org_display_name ?? org_name,
    owner_account_id: org.owner_account_id,
    name: org_name,
    member_count: Number(member_count) || 0,
    package_count: Number(package_count) || 0,
    is_personal_org: Boolean(is_personal_org),
    created_at: String(created_at),
    ...(can_manage_org ? { user_permissions: { can_manage_org: true } } : {}),
  }
}
