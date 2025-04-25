declare global {
  interface Window {
    TSCIRCUIT_REGISTRY_API_BASE_URL: string
    TSCIRCUIT_REGISTRY_TOKEN: string
    TSCIRCUIT_STRIPE_CHECKOUT_BASE_URL: string
    TSCIRCUIT_3D_OBJECT_REF: any
    __DEBUG_CODE_EDITOR_FS_MAP: Map<string, string>
    prettier: {
      format: (code: string, options: any) => string
    }
    prettierPlugins: any
  }
}
