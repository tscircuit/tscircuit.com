import type * as zt from "fake-snippets-api/lib/db/schema"

export const publicMapPackage = (internalPackage: {
  package_id: string
  creator_account_id: string
  owner_org_id: string
  owner_github_username: string | null
  is_source_from_github: boolean
  description: string | null
  latest_version?: string | null
  latest_license?: string | null
  latest_package_release_id?: string | null
  star_count?: number | null
  name: string
  website: string | null
  unscoped_name: string
  updated_at: string
  created_at: string
  ai_description: string | null
  ai_usage_instructions: string | null
  ai_review_text: string | null
  is_snippet: boolean
  is_board: boolean
  is_package: boolean
  is_model: boolean
  is_footprint: boolean
  is_private: boolean | null
  is_unlisted: boolean | null
  latest_package_release_fs_sha: string | null
}): zt.Package => {
  return {
    ...internalPackage,
    latest_package_release_id:
      internalPackage.latest_package_release_id ?? null,
    latest_version: internalPackage.latest_version ?? null,
    license: internalPackage.latest_license ?? null,
    website: internalPackage.website ?? null,
    star_count: internalPackage.star_count ?? 0,
    created_at: internalPackage.created_at,
    updated_at: internalPackage.updated_at,
    is_private: internalPackage.is_private ?? false,
    is_public: internalPackage.is_private === true ? false : true,
    is_unlisted:
      internalPackage.is_private === true
        ? true
        : (internalPackage.is_unlisted ?? false),
  }
}
