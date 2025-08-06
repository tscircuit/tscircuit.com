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
  starred_at: z.string().optional(),
  snippet_type: z.enum(["board", "package", "model", "footprint"]),
  description: z.string().optional(),
  version: z.string().default("0.0.1"),
  star_count: z.number().default(0),
  is_private: z.boolean().default(false),
  is_public: z.boolean().default(true),
  is_unlisted: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
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

const shippingOptionSchema = z.object({
  carrier: z.string(),
  service: z.string(),
  cost: z.number(),
})
export type ShippingOption = z.infer<typeof shippingOptionSchema>

export const quotedComponentSchema = z.object({
  manufacturer_part_number: z.string().nullable(),
  supplier_part_number: z.string().nullable(),
  quantity: z.number().default(0),
  unit_price: z.number().default(0),
  total_price: z.number().default(0),
  available: z.boolean().default(true),
})
export type QuotedComponent = z.infer<typeof quotedComponentSchema>

export const orderQuoteSchema = z.object({
  order_quote_id: z.string(),
  account_id: z.string().nullable(),
  package_release_id: z.string().nullable(),
  is_completed: z.boolean().default(false),
  is_processing: z.boolean().default(true),
  vendor_name: z.string(),
  error: errorSchema.nullable(),
  has_error: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable(),
  quoted_components: z.array(quotedComponentSchema).nullable(),
  bare_pcb_cost: z.number().default(0),
  shipping_options: z.array(shippingOptionSchema),
  total_cost_without_shipping: z.number().default(0),
})
export type OrderQuote = z.infer<typeof orderQuoteSchema>

export const aiReviewSchema = z.object({
  ai_review_id: z.string().uuid(),
  package_release_id: z.string().optional(),
  ai_review_text: z.string().nullable(),
  start_processing_at: z.string().datetime().nullable(),
  finished_processing_at: z.string().datetime().nullable(),
  processing_error: z.any().nullable(),
  created_at: z.string().datetime(),
  display_status: z.enum(["pending", "completed", "failed"]),
})
export type AiReview = z.infer<typeof aiReviewSchema>

export const datasheetPinInformationSchema = z.object({
  pin_number: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
})

export const datasheetSchema = z.object({
  datasheet_id: z.string(),
  chip_name: z.string(),
  created_at: z.string(),
  pin_information: datasheetPinInformationSchema.array().nullable(),
  datasheet_pdf_urls: z.array(z.string()).nullable(),
  ai_description: z.string().nullable(),
})
export type Datasheet = z.infer<typeof datasheetSchema>

export const githubInstallationSchema = z.object({
  github_installation_id: z.string(),
  account_id: z.string(),
  installation_id: z.string(), // GitHub App installation ID
  github_username: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean().default(true),
  access_token: z.string().nullable().optional(), // For storing GitHub access token
  access_token_expires_at: z.string().datetime().nullable().optional(),
})
export type GithubInstallation = z.infer<typeof githubInstallationSchema>

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
  circuit_json_build_error: z.string().nullable().optional(),
  circuit_json_build_error_last_updated_at: z
    .string()
    .datetime()
    .nullable()
    .optional(),
  has_transpiled: z.boolean().default(false),
  transpilation_error: z.string().nullable().optional(),
  fs_sha: z.string().nullable().optional(),
  // Build Status and Display
  display_status: z
    .enum(["pending", "building", "complete", "error"])
    .default("pending"),
  total_build_duration_ms: z.number().nullable().optional(),

  // Transpilation Process
  transpilation_display_status: z
    .enum(["pending", "building", "complete", "error"])
    .default("pending"),
  transpilation_in_progress: z.boolean().default(false),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_logs: z.array(z.any()).default([]),
  transpilation_is_stale: z.boolean().default(false),

  // Circuit JSON Build Process
  circuit_json_build_display_status: z
    .enum(["pending", "building", "complete", "error"])
    .default("pending"),
  circuit_json_build_in_progress: z.boolean().default(false),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_logs: z.array(z.any()).default([]),
  circuit_json_build_is_stale: z.boolean().default(false),

  // AI Review
  ai_review_text: z.string().nullable().default(null).optional(),
  ai_review_started_at: z.string().datetime().nullable().optional(),
  ai_review_completed_at: z.string().datetime().nullable().optional(),
  ai_review_error: z.any().optional().nullable(),
  ai_review_logs: z.array(z.any()).optional().nullable(),
  ai_review_requested: z.boolean().default(false),

  // Preview
  is_pr_preview: z.boolean().default(false),
  github_pr_number: z.number().nullable().optional(),
})
export type PackageRelease = z.infer<typeof packageReleaseSchema>

export const packageFileSchema = z.object({
  package_file_id: z.string(),
  package_release_id: z.string(),
  file_path: z.string(),
  content_text: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  content_mimetype: z.string().nullable().optional(),
  is_release_tarball: z.boolean().optional(),
  npm_pack_output: z.any().nullable().optional(),
})
export type PackageFile = z.infer<typeof packageFileSchema>

export const packageSchema = z.object({
  package_id: z.string(),
  creator_account_id: z.string(),
  owner_org_id: z.string(),
  owner_github_username: z.string().nullable(),
  github_repo_full_name: z.string().nullable(),
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
  website: z.string().nullable().default(null),
  star_count: z.number().default(0),
  ai_description: z.string().nullable(),
  latest_license: z.string().nullable().optional(),
  ai_usage_instructions: z.string().nullable(),
  latest_package_release_fs_sha: z.string().nullable().default(null),
  default_view: z
    .enum(["files", "3d", "pcb", "schematic"])
    .default("files")
    .optional(),
  allow_pr_previews: z.boolean().default(false).optional(),
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

export const packageBuildSchema = z.object({
  package_build_id: z.string().uuid(),
  package_release_id: z.string(),
  created_at: z.string().datetime(),
  transpilation_in_progress: z.boolean().default(false),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_logs: z.array(z.any()).default([]),
  transpilation_error: z.string().nullable().optional(),
  circuit_json_build_in_progress: z.boolean().default(false),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_logs: z.array(z.any()).default([]),
  circuit_json_build_error: z.string().nullable().optional(),
  build_in_progress: z.boolean().default(false),
  build_started_at: z.string().datetime().nullable().optional(),
  build_completed_at: z.string().datetime().nullable().optional(),
  build_error: z.string().nullable().optional(),
  build_error_last_updated_at: z.string().datetime(),
  preview_url: z.string().nullable().optional(),
  build_logs: z.string().nullable().optional(),
  branch_name: z.string().nullable().optional(),
  commit_message: z.string().nullable().optional(),
  commit_author: z.string().nullable().optional(),
})
export type PackageBuild = z.infer<typeof packageBuildSchema>

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
  aiReviews: z.array(aiReviewSchema).default([]),
  datasheets: z.array(datasheetSchema).default([]),
  githubInstallations: z.array(githubInstallationSchema).default([]),
  packageBuilds: z.array(packageBuildSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
