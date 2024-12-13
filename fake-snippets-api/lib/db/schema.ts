import { z } from "zod"

export const snippetSchema = z.object({
  snippet_id: z.string(),
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
  datasheet_url: z.string().url().optional().nullable(),
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

export const accountSnippetSchema = z.object({
  account_id: z.string(),
  snippet_id: z.string(),
  has_starred: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type AccountSnippet = z.infer<typeof accountSnippetSchema>

export const databaseSchema = z.object({
  idCounter: z.number().default(0),
  snippets: z.array(snippetSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
  loginPages: z.array(loginPageSchema).default([]),
  accounts: z.array(accountSchema).default([]),
  orders: z.array(orderSchema).default([]),
  orderFiles: z.array(orderFileSchema).default([]),
  accountSnippets: z.array(accountSnippetSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
