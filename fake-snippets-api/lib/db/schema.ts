import { z } from "zod"

export const errorSchema = z
  .object({
    error_code: z.string(),
    message: z.string(),
  })
  .passthrough()

export const errorResponseSchema = z.object({
  error: errorSchema,
})

export const snippetSchema = z.object({
  snippet_id: z.string(),
  package_release_id: z.string(),
  name: z.string(),
  unscoped_name: z.string(),
  owner_name: z.string(),
  is_starred: z.boolean().default(false),
  code: z.string(),
  dts: z.string().optional(),
  compiled_js: z.string().optional().nullable(),
  circuit_json: z.array(z.record(z.any())).optional().nullable(),
  manual_edits_json_content: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  snippet_type: z.enum(["board", "package", "model", "footprint"]),
  description: z.string().optional(),
  version: z.string().default("0.0.1"),
  star_count: z.number().default(0),
  is_private: z.boolean().default(false),
  is_public: z.boolean().default(true),
  is_unlisted: z.boolean().default(false),
})
export type Snippet = z.infer<typeof snippetSchema>

export const sessionSchema = z.object({
  session_id: z.string(),
  account_id: z.string(),
  expires_at: z.string(),
  is_cli_session: z.boolean(),
})
export type Session = z.infer<typeof sessionSchema>

export const loginPageSchema = z.object({
  login_page_id: z.string(),
  login_page_auth_token: z.string(),
  was_login_successful: z.boolean(),
  has_been_used_to_create_session: z.boolean(),
  created_at: z.string(),
  expires_at: z.string(),
})
export type LoginPage = z.infer<typeof loginPageSchema>

export const shippingInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().optional(),
  address: z.string(),
  apartment: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  phone: z.string(),
})

export const accountSchema = z.object({
  account_id: z.string(),
  github_username: z.string(),
  shippingInfo: shippingInfoSchema.optional(),
})
export type Account = z.infer<typeof accountSchema>

export const orderSchema = z.object({
  order_id: z.string(),
  account_id: z.string().nullable(),
  is_running: z.boolean(),
  is_started: z.boolean(),
  is_finished: z.boolean(),
  error: errorSchema.nullable(),
  has_error: z.boolean(),
  created_at: z.string(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  circuit_json: z.any(),
})
export type Order = z.infer<typeof orderSchema>

export const orderFileSchema = z.object({
  order_file_id: z.string(),
  order_id: z.string(),
  is_gerbers_zip: z.boolean(),
  content_type: z.string(),
  for_provider: z.string().nullable(),
  uploaded_at: z.string(),
  content_text: z.string().nullable(),
  content_bytes: z.instanceof(Uint8Array).nullable(),
})
export type OrderFile = z.infer<typeof orderFileSchema>

export const orderQuoteComponentSchema = z.object({
  manufacturer_part_number: z.string().nullable(),
  supplier_part_number: z.string().nullable(),
  quantity: z.number().default(0),
  unit_price: z.number().default(0),
  total_price: z.number().default(0),
  available: z.boolean().default(true),
})
export type OrderQuoteComponent = z.infer<typeof orderQuoteComponentSchema>

export const orderQuoteSchema = z.object({
  order_quote_id: z.string(),
  account_id: z.string().nullable(),
  package_release_id: z.string().nullable(),
  is_completed: z.boolean().default(false),
  is_processing: z.boolean().default(true),
  error: errorSchema.nullable(),
  has_error: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
  quoted_components: z.array(orderQuoteComponentSchema).default([]),
  pcb_price: z.number().default(0),
  total_components_price: z.number().default(0),
  shipping_price: z.number().default(0),
  total_price: z.number().default(0),
})
export type OrderQuote = z.infer<typeof orderQuoteSchema>

// TODO: Remove this schema after migration to accountPackages is complete
export const accountSnippetSchema = z.object({
  account_id: z.string(),
  snippet_id: z.string(),
  has_starred: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type AccountSnippet = z.infer<typeof accountSnippetSchema>

export const accountPackageSchema = z.object({
  account_package_id: z.string(),
  account_id: z.string(),
  package_id: z.string(),
  is_starred: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type AccountPackage = z.infer<typeof accountPackageSchema>

export const packageReleaseSchema = z.object({
  package_release_id: z.string(),
  package_id: z.string(),
  version: z.string().nullable(),
  is_locked: z.boolean(),
  is_latest: z.boolean(),
  created_at: z.string().datetime(),
  commit_sha: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
})
export type PackageRelease = z.infer<typeof packageReleaseSchema>

export const packageFileSchema = z.object({
  package_file_id: z.string(),
  package_release_id: z.string(),
  file_path: z.string(),
  content_text: z.string().nullable().optional(),
  created_at: z.string().datetime(),
})
export type PackageFile = z.infer<typeof packageFileSchema>

export const packageSchema = z.object({
  package_id: z.string(),
  creator_account_id: z.string(),
  owner_org_id: z.string(),
  owner_github_username: z.string().nullable(),
  name: z.string(),
  unscoped_name: z.string(),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_snippet: z.boolean().default(false),
  is_board: z.boolean().default(false),
  is_package: z.boolean().default(false),
  is_model: z.boolean().default(false),
  is_footprint: z.boolean().default(false),
  is_private: z.boolean().nullable().default(false),
  is_public: z.boolean().nullable().default(true),
  is_unlisted: z.boolean().nullable().default(false),
  is_source_from_github: z.boolean().default(false),
  snippet_type: z.enum(["board", "package", "model", "footprint"]).optional(),
  latest_package_release_id: z.string().nullable(),
  latest_version: z.string().nullable(),
  license: z.string().nullable(),
  star_count: z.number().default(0),
  ai_description: z.string().nullable(),
  ai_usage_instructions: z.string().nullable(),
})
export type Package = z.infer<typeof packageSchema>

export const jlcpcbOrderStateSchema = z.object({
  jlcpcb_order_state_id: z.string(),
  order_id: z.string(),
  are_gerbers_uploaded: z.boolean().default(false),
  is_gerber_analyzed: z.boolean().default(false),
  are_initial_costs_calculated: z.boolean().default(false),
  is_pcb_added_to_cart: z.boolean().default(false),
  is_bom_uploaded: z.boolean().default(false),
  is_pnp_uploaded: z.boolean().default(false),
  is_bom_pnp_analyzed: z.boolean().default(false),
  is_bom_parsing_complete: z.boolean().default(false),
  are_components_available: z.boolean().default(false),
  is_patch_map_generated: z.boolean().default(false),
  is_json_merge_file_created: z.boolean().default(false),
  is_dfm_result_generated: z.boolean().default(false),
  are_files_downloaded: z.boolean().default(false),
  are_product_categories_fetched: z.boolean().default(false),
  are_final_costs_calculated: z.boolean().default(false),
  is_json_merge_file_updated: z.boolean().default(false),
  is_added_to_cart: z.boolean().default(false),
  uploaded_gerber_metadata: z.any().nullable().default(null),
  gerber_analysis: z.any().nullable().default(null),
  created_at: z.string(),
  are_gerbers_generated: z.boolean().default(false),
  current_step: z.string().nullable().default(null),
})
export type JlcpcbOrderState = z.infer<typeof jlcpcbOrderStateSchema>

export const jlcpcbOrderStepRunSchema = z.object({
  jlcpcb_order_step_run_id: z.string(),
  is_running: z.boolean().nullable().default(null),
  step_function_name: z.string().nullable().default(null),
  jlcpcb_order_state_id: z.string().nullable().default(null),
  error_message: z.string().nullable().default(null),
  created_at: z.string(),
})
export type JlcpcbOrderStepRun = z.infer<typeof jlcpcbOrderStepRunSchema>

export const databaseSchema = z.object({
  idCounter: z.number().default(0),
  snippets: z.array(snippetSchema).default([]),
  packageReleases: z.array(packageReleaseSchema).default([]),
  packageFiles: z.array(packageFileSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
  loginPages: z.array(loginPageSchema).default([]),
  accounts: z.array(accountSchema).default([]),
  packages: z.array(packageSchema).default([]),
  orders: z.array(orderSchema).default([]),
  orderFiles: z.array(orderFileSchema).default([]),
  accountSnippets: z.array(accountSnippetSchema).default([]),
  accountPackages: z.array(accountPackageSchema).default([]),
  jlcpcbOrderState: z.array(jlcpcbOrderStateSchema).default([]),
  jlcpcbOrderStepRuns: z.array(jlcpcbOrderStepRunSchema).default([]),
  orderQuotes: z.array(orderQuoteSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
