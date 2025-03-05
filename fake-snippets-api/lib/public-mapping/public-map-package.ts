import { z } from "zod"
import * as ZT from "fake-snippets-api/lib/db/schema"

export const publicMapPackage = (internal_package: {
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
  unscoped_name: string
  updated_at: string
  created_at: string
  ai_description: string | null
  is_snippet: boolean
  is_board: boolean
  is_package: boolean
  is_model: boolean
  is_footprint: boolean
}): ZT.Package => {
  return {
    ...internal_package,
    latest_package_release_id:
      internal_package.latest_package_release_id ?? null,
    latest_version: internal_package.latest_version ?? null,
    license: internal_package.latest_license ?? null,
    star_count: internal_package.star_count ?? 0,
    created_at: internal_package.created_at,
    updated_at: internal_package.updated_at,
    is_private: false,
    is_public: true,
    is_unlisted: false,
  }
}
