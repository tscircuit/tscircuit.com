import { z } from "zod"

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
  account_id: z.string(),
  is_draft: z.boolean(),
  is_pending_validation_by_fab: z.boolean(),
  is_pending_review_by_fab: z.boolean(),
  is_validated_by_fab: z.boolean(),
  is_approved_by_fab_review: z.boolean(),
  is_approved_by_orderer: z.boolean(),
  is_in_production: z.boolean(),
  is_shipped: z.boolean(),
  is_cancelled: z.boolean(),
  should_be_blank_pcb: z.boolean(),
  should_include_stencil: z.boolean(),
  jlcpcb_order_params: z.record(z.any()),
  circuit_json: z.array(z.record(z.any())),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Order = z.infer<typeof orderSchema>

export const orderFileSchema = z.object({
  order_file_id: z.string(),
  order_id: z.string(),
  is_gerbers_zip: z.boolean(),
  file_content: z.instanceof(Buffer),
  content_type: z.string(),
  for_provider: z.string().nullable(),
  uploaded_at: z.string(),
})
export type OrderFile = z.infer<typeof orderFileSchema>

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
})
export type Package = z.infer<typeof packageSchema>

export const errorSchema = z
  .object({
    error_code: z.string(),
    message: z.string(),
  })
  .passthrough()

export const errorResponseSchema = z.object({
  error: errorSchema,
})

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
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
