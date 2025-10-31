import { Object3D, Object3DEventMap } from "three"

declare global {
  interface Window {
    TSCIRCUIT_REGISTRY_API_BASE_URL: string
    TSCIRCUIT_REGISTRY_TOKEN: string | null
    TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL: string
    TSCIRCUIT_3D_OBJECT_REF: Object3D<Object3DEventMap> | undefined
    __DEBUG_CODE_EDITOR_FS_MAP: Map<string, string>
    prettier: {
      format: (code: string, options: any) => string
    }
    prettierPlugins: any
    /** Timestamp in milliseconds of when the application was first loaded */
    __APP_LOADED_AT?: number
    __hideLoader?: () => void
  }
}

export interface PackageInfo {
  name: string
  unscoped_name: string
  owner_github_username: string
  star_count: string
  description: string
  ai_description: string
  ai_usage_instructions: string
  creator_account_id?: string
  owner_org_id?: string
  package_id: string
  latest_package_release_id: string
}
