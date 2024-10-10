import { z } from "zod"

export const snippetSchema = z.object({
  snippet_id: z.string(),
  name: z.string(),
  unscoped_name: z.string(),
  owner_name: z.string(),
  code: z.string(),
  dts: z.string().optional(),
  compiled_js: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  snippet_type: z.enum(["board", "package", "model", "footprint"]),
  description: z.string().optional(),
  version: z.string().default("0.0.1"),
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

export const accountSchema = z.object({
  account_id: z.string(),
  github_username: z.string(),
})
export type Account = z.infer<typeof accountSchema>

export const databaseSchema = z.object({
  idCounter: z.number().default(0),
  snippets: z.array(snippetSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
  loginPages: z.array(loginPageSchema).default([]),
  accounts: z.array(accountSchema).default([]),
})
export type DatabaseSchema = z.infer<typeof databaseSchema>
