// fake-snippets-api/lib/db/db-client.ts
import { randomUUID } from "crypto";
import { hoist } from "zustand-hoist";
import { createStore } from "zustand/vanilla";
import { combine } from "zustand/middleware";

// fake-snippets-api/lib/db/schema.ts
import { z } from "zod";
var errorSchema = z.object({
  error_code: z.string(),
  message: z.string()
}).passthrough();
var errorResponseSchema = z.object({
  error: errorSchema
});
var log = z.any();
var snippetSchema = z.object({
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
  tags: z.array(z.string()).optional()
});
var sessionSchema = z.object({
  session_id: z.string(),
  account_id: z.string(),
  expires_at: z.string(),
  is_cli_session: z.boolean()
});
var loginPageSchema = z.object({
  login_page_id: z.string(),
  login_page_auth_token: z.string(),
  was_login_successful: z.boolean(),
  has_been_used_to_create_session: z.boolean(),
  created_at: z.string(),
  expires_at: z.string()
});
var shippingInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().optional(),
  address: z.string(),
  apartment: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  phone: z.string()
});
var accountSchema = z.object({
  account_id: z.string(),
  github_username: z.string(),
  tscircuit_handle: z.string().nullable(),
  shippingInfo: shippingInfoSchema.optional(),
  personal_org_id: z.string().nullable(),
  is_tscircuit_staff: z.boolean().default(false),
  email: z.string().nullable().optional(),
  created_at: z.date()
});
var publicAccountSchema = z.object({
  account_id: z.string(),
  github_username: z.string().nullable(),
  tscircuit_handle: z.string().nullable(),
  personal_org_id: z.string().nullable(),
  created_at: z.date()
});
var orderSchema = z.object({
  order_id: z.string(),
  account_id: z.string().nullable(),
  submitted_package_release_id: z.string().nullable().optional(),
  adapted_package_release_id: z.string().nullable().optional(),
  stripe_checkout_session_id: z.string().nullable().optional(),
  stripe_checkout_session_url: z.string().nullable().optional(),
  is_stripe_checkout_session_complete: z.boolean().optional(),
  is_stripe_checkout_session_expired: z.boolean().optional(),
  is_stripe_checkout_session_open: z.boolean().optional(),
  is_stripe_payment_paid: z.boolean().optional(),
  is_running: z.boolean(),
  is_started: z.boolean(),
  is_finished: z.boolean(),
  error: errorSchema.nullable(),
  has_error: z.boolean(),
  created_at: z.string(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  circuit_json: z.any()
});
var orderFileSchema = z.object({
  order_file_id: z.string(),
  order_id: z.string(),
  is_gerbers_zip: z.boolean(),
  content_type: z.string(),
  for_provider: z.string().nullable(),
  uploaded_at: z.string(),
  content_text: z.string().nullable(),
  content_bytes: z.instanceof(Uint8Array).nullable()
});
var bugReportSchema = z.object({
  bug_report_id: z.string().uuid(),
  reporter_account_id: z.string(),
  text: z.string().nullable(),
  is_auto_deleted: z.boolean().default(false),
  delete_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  file_count: z.number().int()
});
var bugReportFileSchema = z.object({
  bug_report_file_id: z.string().uuid(),
  bug_report_id: z.string().uuid(),
  file_path: z.string(),
  content_mimetype: z.string(),
  is_text: z.boolean(),
  created_at: z.string().datetime(),
  content_text: z.string().nullable(),
  content_bytes: z.instanceof(Uint8Array).nullable()
});
var bugReportFileResponseSchema = bugReportFileSchema.omit({
  content_text: true,
  content_bytes: true
});
var shippingOptionSchema = z.object({
  carrier: z.string(),
  service: z.string(),
  cost: z.number()
});
var quotedComponentSchema = z.object({
  manufacturer_part_number: z.string().nullable(),
  supplier_part_number: z.string().nullable(),
  quantity: z.number().default(0),
  unit_price: z.number().default(0),
  total_price: z.number().default(0),
  available: z.boolean().default(true)
});
var orderQuoteSchema = z.object({
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
  total_cost_without_shipping: z.number().default(0)
});
var aiReviewSchema = z.object({
  ai_review_id: z.string().uuid(),
  package_release_id: z.string().optional(),
  ai_review_text: z.string().nullable(),
  start_processing_at: z.string().datetime().nullable(),
  finished_processing_at: z.string().datetime().nullable(),
  processing_error: z.any().nullable(),
  created_at: z.string().datetime(),
  display_status: z.enum(["pending", "completed", "failed"])
});
var datasheetPinInformationSchema = z.object({
  pin_number: z.string(),
  name: z.string(),
  description: z.string(),
  capabilities: z.array(z.string())
});
var datasheetSchema = z.object({
  datasheet_id: z.string(),
  chip_name: z.string(),
  created_at: z.string(),
  pin_information: datasheetPinInformationSchema.array().nullable(),
  datasheet_pdf_urls: z.array(z.string()).nullable(),
  ai_description: z.string().nullable()
});
var githubInstallationSchema = z.object({
  github_installation_id: z.string(),
  account_id: z.string(),
  installation_id: z.string(),
  // GitHub App installation ID
  github_username: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean().default(true),
  access_token: z.string().nullable().optional(),
  // For storing GitHub access token
  access_token_expires_at: z.string().datetime().nullable().optional()
});
var accountSnippetSchema = z.object({
  account_id: z.string(),
  snippet_id: z.string(),
  has_starred: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});
var accountPackageSchema = z.object({
  account_package_id: z.string(),
  account_id: z.string(),
  package_id: z.string(),
  is_starred: z.boolean(),
  starred_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string()
});
var packageReleaseSchema = z.object({
  package_release_id: z.string(),
  package_id: z.string(),
  version: z.string().nullable(),
  is_locked: z.boolean(),
  is_latest: z.boolean(),
  created_at: z.string().datetime(),
  commit_sha: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  circuit_json_build_error: z.string().nullable().optional(),
  circuit_json_build_error_last_updated_at: z.string().datetime().nullable().optional(),
  has_transpiled: z.boolean().default(false),
  transpilation_error: z.string().nullable().optional(),
  fs_sha: z.string().nullable().optional(),
  ready_to_build: z.boolean().default(false),
  pcb_trace_count: z.number().nullable().optional(),
  active_package_build_id: z.string().nullable().optional(),
  // Build Status and Display
  display_status: z.enum(["pending", "building", "complete", "error"]).default("pending"),
  total_build_duration_ms: z.number().nullable().optional(),
  // Transpilation Process
  transpilation_display_status: z.enum(["pending", "building", "complete", "error"]).default("pending"),
  transpilation_in_progress: z.boolean().default(false),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_logs: z.array(z.any()).default([]),
  transpilation_is_stale: z.boolean().default(false),
  // User Code Job Process
  ext_user_code_job_id: z.string().nullable().default(null),
  user_code_job_started_at: z.string().datetime().nullable().default(null),
  user_code_job_completed_at: z.string().datetime().nullable().default(null),
  user_code_job_completed_logs: z.array(z.any()).nullable().default(null),
  user_code_job_error: errorSchema.nullable().default(null),
  user_code_job_log_stream_url: z.string().nullable().default(null),
  // Circuit JSON Build Process
  circuit_json_build_display_status: z.enum(["pending", "building", "complete", "error"]).default("pending"),
  circuit_json_build_in_progress: z.boolean().default(false),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_logs: z.array(z.any()).default([]),
  circuit_json_build_is_stale: z.boolean().default(false),
  // Image Generation Process
  image_generation_display_status: z.enum(["pending", "building", "complete", "error"]).default("pending"),
  image_generation_in_progress: z.boolean().default(false),
  image_generation_started_at: z.string().datetime().nullable().optional(),
  image_generation_completed_at: z.string().datetime().nullable().optional(),
  image_generation_logs: z.array(z.any()).nullable().default(null),
  image_generation_is_stale: z.boolean().default(false),
  image_generation_error: z.string().nullable().optional(),
  image_generation_error_last_updated_at: z.string().datetime().nullable().optional(),
  // AI Review
  ai_review_text: z.string().nullable().default(null).optional(),
  ai_review_started_at: z.string().datetime().nullable().optional(),
  ai_review_completed_at: z.string().datetime().nullable().optional(),
  ai_review_error: z.any().optional().nullable(),
  ai_review_logs: z.array(z.any()).optional().nullable(),
  ai_review_requested: z.boolean().default(false),
  // Preview
  is_pr_preview: z.boolean().default(false),
  pr_number: z.number().nullable().default(null),
  pr_title: z.string().nullable().default(null),
  branch_name: z.string().nullable().default(null),
  // Latest Build Reference
  latest_package_build_id: z.string().nullable().optional(),
  commit_message: z.string().nullable().optional(),
  commit_author: z.string().nullable().optional(),
  // Preview images url
  pcb_preview_image_url: z.string().nullable().default(null),
  sch_preview_image_url: z.string().nullable().default(null),
  cad_preview_image_url: z.string().nullable().default(null),
  // Website URL
  package_release_website_url: z.string().nullable().default(null)
});
var publicPackageReleaseSchema = z.object({
  package_release_id: z.string(),
  package_id: z.string(),
  version: z.string().nullable(),
  is_locked: z.boolean(),
  is_latest: z.boolean(),
  ready_to_build: z.boolean().optional(),
  pcb_trace_count: z.number().nullable().optional(),
  active_package_build_id: z.string().nullable().optional(),
  is_pr_preview: z.boolean(),
  created_at: z.string().datetime(),
  circuit_json_build_error: z.string().nullable().optional(),
  circuit_json_build_error_last_updated_at: z.string().datetime().nullable().optional(),
  has_transpiled: z.boolean().nullable().optional(),
  transpilation_error: z.string().nullable().optional(),
  transpilation_logs: z.array(log).nullable().optional(),
  transpilation_in_progress: z.boolean().nullable().optional(),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_is_stale: z.boolean().nullable().optional(),
  transpilation_display_status: z.string().nullable().optional(),
  fs_sha: z.string().nullable().optional(),
  circuit_json_build_logs: z.array(log).nullable().optional(),
  circuit_json_build_in_progress: z.boolean().nullable().optional(),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_is_stale: z.boolean().nullable().optional(),
  circuit_json_build_display_status: z.string().nullable().optional(),
  image_generation_error: z.string().nullable().optional(),
  image_generation_error_last_updated_at: z.string().datetime().nullable().optional(),
  image_generation_logs: z.array(log).nullable().optional(),
  image_generation_in_progress: z.boolean().nullable().optional(),
  image_generation_started_at: z.string().datetime().nullable().optional(),
  image_generation_completed_at: z.string().datetime().nullable().optional(),
  image_generation_is_stale: z.boolean().nullable().optional(),
  image_generation_display_status: z.string().nullable().optional(),
  pcb_preview_image_url: z.string().nullable().optional(),
  sch_preview_image_url: z.string().nullable().optional(),
  cad_preview_image_url: z.string().nullable().optional(),
  display_status: z.string().nullable().optional(),
  latest_package_build_id: z.string().nullable().optional(),
  user_code_job_started_at: z.string().datetime().nullable().optional(),
  user_code_job_completed_at: z.string().datetime().nullable().optional(),
  user_code_job_error: z.any().nullable().optional(),
  user_code_job_completed_logs: z.array(log).nullable().optional(),
  user_code_job_log_stream_url: z.string().nullable().optional(),
  ai_review_requested: z.boolean().optional(),
  ai_review_text: z.string().nullable().optional(),
  ai_review_started_at: z.string().datetime().nullable().optional(),
  ai_review_completed_at: z.string().datetime().nullable().optional(),
  ai_review_error: z.any().nullable().optional(),
  github_pr_number: z.number().nullable().optional(),
  github_pr_title: z.string().nullable().optional(),
  github_branch_name: z.string().nullable().optional(),
  github_commit_sha: z.string().nullable(),
  package_release_website_url: z.string().nullable().optional()
});
var packageFileSchema = z.object({
  package_file_id: z.string(),
  package_release_id: z.string(),
  file_path: z.string(),
  content_text: z.string().nullable().optional(),
  content_bytes: z.instanceof(Buffer).nullable().optional(),
  content_mimetype: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  is_release_tarball: z.boolean().optional(),
  npm_pack_output: z.any().nullable().optional(),
  is_text: z.boolean().optional()
});
var packageFileLiteSchema = packageFileSchema.omit({
  content_text: true
});
var packageSchema = z.object({
  package_id: z.string(),
  creator_account_id: z.string(),
  owner_org_id: z.string(),
  owner_github_username: z.string().nullable().optional(),
  org_owner_tscircuit_handle: z.string().nullable().optional(),
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
  default_view: z.enum(["files", "3d", "pcb", "schematic"]).default("files").optional(),
  allow_pr_previews: z.boolean().default(false).optional(),
  public_dist_enabled: z.boolean().default(false).optional(),
  is_starred: z.boolean().default(false).optional(),
  latest_pcb_preview_image_url: z.string().nullable().optional(),
  latest_sch_preview_image_url: z.string().nullable().optional(),
  latest_cad_preview_image_url: z.string().nullable().optional(),
  github_installation_id: z.string().nullable().optional()
});
var packageBuildSchema = z.object({
  package_build_id: z.string().uuid(),
  package_release_id: z.string(),
  created_at: z.string().datetime(),
  transpilation_in_progress: z.boolean().default(false),
  transpilation_started_at: z.string().datetime().nullable().optional(),
  transpilation_completed_at: z.string().datetime().nullable().optional(),
  transpilation_logs: z.array(log).nullable(),
  transpilation_error: z.string().nullable().optional(),
  circuit_json_build_in_progress: z.boolean().default(false),
  circuit_json_build_started_at: z.string().datetime().nullable().optional(),
  circuit_json_build_completed_at: z.string().datetime().nullable().optional(),
  circuit_json_build_logs: z.array(log).nullable(),
  circuit_json_build_error: z.string().nullable().optional(),
  image_generation_in_progress: z.boolean().default(false),
  image_generation_started_at: z.string().datetime().nullable().optional(),
  image_generation_completed_at: z.string().datetime().nullable().optional(),
  image_generation_logs: z.array(log).nullable(),
  image_generation_error: z.string().nullable().optional(),
  build_in_progress: z.boolean().default(false),
  build_started_at: z.string().datetime().nullable().optional(),
  build_completed_at: z.string().datetime().nullable().optional(),
  build_error: z.string().nullable().optional(),
  build_error_last_updated_at: z.string().datetime(),
  package_build_website_url: z.string().nullable().optional(),
  build_logs: z.string().nullable().optional(),
  user_code_job_started_at: z.string().datetime().nullable().optional(),
  user_code_job_completed_at: z.string().datetime().nullable().optional(),
  user_code_job_error: z.any().nullable().optional(),
  user_code_job_completed_logs: z.array(log).nullable().optional(),
  user_code_job_log_stream_url: z.string().nullable().optional()
});
var orgSchema = z.object({
  org_id: z.string(),
  owner_account_id: z.string(),
  is_personal_org: z.boolean().default(false),
  created_at: z.string().datetime(),
  org_display_name: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
  github_handle: z.string().nullable(),
  tscircuit_handle: z.string().nullable()
});
var orgAccountSchema = z.object({
  org_account_id: z.string(),
  org_id: z.string(),
  account_id: z.string(),
  is_owner: z.boolean().default(false),
  created_at: z.string().datetime(),
  can_manage_org: z.boolean().default(false)
});
var orgInvitationSchema = z.object({
  org_invitation_id: z.string(),
  org_id: z.string(),
  invitee_email: z.string().email().nullable(),
  inviter_account_id: z.string(),
  invitation_token: z.string(),
  is_link_invite: z.boolean().default(false),
  is_pending: z.boolean().default(true),
  is_accepted: z.boolean().default(false),
  is_expired: z.boolean().default(false),
  is_revoked: z.boolean().default(false),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  accepted_at: z.string().datetime().nullable(),
  accepted_by_account_id: z.string().nullable()
});
var userPermissionsSchema = z.object({
  can_manage_org: z.boolean().optional(),
  can_manage_packages: z.boolean().optional()
});
var publicOrgSchema = z.object({
  org_id: z.string(),
  //.uuid(),
  owner_account_id: z.string(),
  //.uuid(),
  name: z.string().nullable(),
  member_count: z.number(),
  is_personal_org: z.boolean(),
  display_name: z.string().optional(),
  package_count: z.number(),
  avatar_url: z.string().nullable().optional(),
  github_handle: z.string().nullable(),
  github_installation_handles: z.array(z.string()).optional(),
  tscircuit_handle: z.string().nullable(),
  created_at: z.string(),
  user_permissions: userPermissionsSchema.optional()
});
var packageDomainPointsToEnum = z.enum([
  "package_release",
  "package_build",
  "package_release_with_tag",
  "package"
]);
var packageDomainSchema = z.object({
  package_domain_id: z.string(),
  points_to: packageDomainPointsToEnum,
  package_release_id: z.string().nullable().optional(),
  package_build_id: z.string().nullable().optional(),
  package_id: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  default_main_component_path: z.string().nullable().optional(),
  fully_qualified_domain_name: z.string().nullable().optional(),
  created_at: z.coerce.date()
});
var publicPackageDomainSchema = z.object({
  package_domain_id: z.string(),
  points_to: packageDomainPointsToEnum,
  package_release_id: z.string().nullable().optional(),
  package_build_id: z.string().nullable().optional(),
  package_id: z.string().nullable().optional(),
  tag: z.string().nullable().optional(),
  default_main_component_path: z.string().nullable().optional(),
  fully_qualified_domain_name: z.string().nullable().optional(),
  created_at: z.string().datetime()
});
var orgDomainPointsToEnum = z.enum(["merged_pcm_repositories"]);
var orgDomainLinkedPackagePointsToEnum = z.enum(["package_release"]);
var orgDomainLinkedPackageSchema = z.object({
  org_domain_linked_package_id: z.string(),
  org_domain_id: z.string(),
  points_to: orgDomainLinkedPackagePointsToEnum,
  package_release_id: z.string().nullable().optional(),
  created_at: z.coerce.date()
});
var publicOrgDomainLinkedPackageSchema = z.object({
  org_domain_linked_package_id: z.string(),
  org_domain_id: z.string(),
  points_to: orgDomainLinkedPackagePointsToEnum,
  package_release_id: z.string().nullable().optional(),
  created_at: z.string().datetime()
});
var orgDomainSchema = z.object({
  org_domain_id: z.string(),
  org_id: z.string(),
  fully_qualified_domain_name: z.string(),
  pcm_repository_name: z.string().nullable().optional(),
  points_to: orgDomainPointsToEnum,
  created_at: z.coerce.date()
});
var publicOrgDomainSchema = z.object({
  org_domain_id: z.string(),
  org_id: z.string(),
  fully_qualified_domain_name: z.string(),
  pcm_repository_name: z.string().nullable().optional(),
  points_to: orgDomainPointsToEnum,
  created_at: z.string().datetime(),
  linked_packages: z.array(publicOrgDomainLinkedPackageSchema)
});
var databaseSchema = z.object({
  idCounter: z.number().default(0),
  snippets: z.array(snippetSchema).default([]),
  packageReleases: z.array(packageReleaseSchema).default([]),
  packageFiles: z.array(packageFileSchema).default([]),
  sessions: z.array(sessionSchema).default([]),
  loginPages: z.array(loginPageSchema).default([]),
  accounts: z.array(accountSchema).default([]),
  packages: z.array(packageSchema).default([]),
  orders: z.array(orderSchema).default([]),
  organizations: z.array(orgSchema).default([]),
  orgAccounts: z.array(orgAccountSchema).default([]),
  orgInvitations: z.array(orgInvitationSchema).default([]),
  orderFiles: z.array(orderFileSchema).default([]),
  accountSnippets: z.array(accountSnippetSchema).default([]),
  accountPackages: z.array(accountPackageSchema).default([]),
  orderQuotes: z.array(orderQuoteSchema).default([]),
  aiReviews: z.array(aiReviewSchema).default([]),
  datasheets: z.array(datasheetSchema).default([]),
  githubInstallations: z.array(githubInstallationSchema).default([]),
  packageBuilds: z.array(packageBuildSchema).default([]),
  bugReports: z.array(bugReportSchema).default([]),
  bugReportFiles: z.array(bugReportFileSchema).default([]),
  packageDomains: z.array(packageDomainSchema).default([]),
  orgDomains: z.array(orgDomainSchema).default([]),
  orgDomainLinkedPackages: z.array(orgDomainLinkedPackageSchema).default([])
});
var tscircuitHandleSchema = z.string().min(1).max(40).regex(
  /^[0-9a-z_-]+$/,
  "tscircuit_handle must be lowercase and may only contain lowercase letters, numbers, underscores, and hyphens"
);
var tscircuitHandleStrictSchema = z.string().min(3).max(40).regex(
  /^[0-9a-z][0-9a-z_-]*[0-9a-z]$/,
  "tscircuit_handle must be lowercase, start and end with a lowercase letter or number, and may only contain lowercase letters, numbers, underscores, and hyphens"
);
var memberSchema = accountSchema.omit({ shippingInfo: true }).extend({
  joined_at: z.string(),
  org_member_permissions: userPermissionsSchema,
  avatar_url: z.string().nullable().optional()
});

// fake-snippets-api/lib/db/seed.ts
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// fake-snippets-api/lib/db/autoload-dev-packages.ts
import fs from "fs";
import path from "path";
import axios from "redaxios";
var extractTsciDependencies = (code) => {
  const regex = /@tsci\/([^.]+)\.([^"'\s]+)/g;
  const matches = Array.from(code.matchAll(regex));
  return matches.map((match) => ({
    owner: match[1],
    name: match[2]
  }));
};
var registryApi = axios.create({
  baseURL: "https://api.tscircuit.com",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});
var fetchPackageFromRegistry = async (owner, name) => {
  const fullName = `${owner}/${name}`;
  console.log(`[autoload-dev-pkgs] \u{1F4E6} Fetching package ${fullName}...`);
  let packageData;
  try {
    const response = await registryApi.post("/packages/get", {
      name: fullName
    });
    packageData = response.data;
  } catch (e) {
    console.error(`Failed to fetch package data for ${fullName}:`, e);
    throw e;
  }
  let releaseData;
  try {
    const response = await registryApi.post("/package_releases/get", {
      package_id: packageData.package.package_id,
      is_latest: true
    });
    releaseData = response.data;
  } catch (e) {
    console.error(
      `[autoload-dev-pkgs] \u274C Failed to fetch release data for ${fullName}:`,
      e
    );
    throw e;
  }
  let filesData;
  try {
    const response = await registryApi.post(
      `package_files/list?package_release_id=${releaseData.package_release.package_release_id}`,
      {}
    );
    filesData = response.data;
    for (const file of filesData.package_files) {
      try {
        const fileResponse = await registryApi.post(
          `/package_files/get?package_file_id=${file.package_file_id}`,
          {}
        );
        file.content_text = fileResponse.data.package_file.content_text;
      } catch (e) {
        console.error(
          `[autoload-dev-pkgs] \u274C Failed to fetch content for file ${file.file_path} in package ${fullName}:`,
          e
        );
        throw e;
      }
    }
  } catch (e) {
    console.error(
      `[autoload-dev-pkgs] \u274C Failed to fetch files data for ${fullName}:`,
      e
    );
    throw e;
  }
  return {
    package: packageData.package,
    release: releaseData.package_release,
    files: filesData.package_files
  };
};
var loadPackageWithDependencies = async (db, owner, name, loadedPackages = /* @__PURE__ */ new Set()) => {
  const packageKey = `${owner}/${name}`;
  if (loadedPackages.has(packageKey)) {
    return true;
  }
  let result;
  try {
    result = await fetchPackageFromRegistry(owner, name);
  } catch (e) {
    console.error(`[autoload-dev-pkgs] \u274C Failed to load ${packageKey}`);
    return false;
  }
  const { package: pkg, release, files } = result;
  if (db.getPackageById(pkg.package_id)) {
    console.log(`[autoload-dev-pkgs] \u26A1 Package ${packageKey} already exists`);
    return true;
  }
  db.addPackage({
    ...pkg,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    latest_package_release_id: release.package_release_id,
    star_count: Math.floor(Math.random() * 11)
  });
  db.addPackageRelease({
    ...release,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_logs: Array.isArray(release.transpilation_logs) ? release.transpilation_logs : [],
    circuit_json_build_logs: Array.isArray(release.circuit_json_build_logs) ? release.circuit_json_build_logs : [],
    transpilation_display_status: release.transpilation_display_status ?? "pending"
  });
  for (const file of files) {
    db.addPackageFile({
      ...file,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  loadedPackages.add(packageKey);
  console.log(`[autoload-dev-pkgs] \u{1F4E6} Loaded ${packageKey}`);
  const mainFile = files.find(
    (f) => f.file_path === "index.tsx" || f.file_path === "index.ts"
  );
  if (!mainFile?.content_text) {
    return true;
  }
  const dependencies = extractTsciDependencies(mainFile.content_text);
  let allDepsLoaded = true;
  for (const dep of dependencies) {
    const depLoaded = await loadPackageWithDependencies(
      db,
      dep.owner,
      dep.name,
      loadedPackages
    );
    if (!depLoaded) {
      allDepsLoaded = false;
      console.warn(
        `[autoload-dev-pkgs] \u26A0\uFE0F Failed to load dependency ${dep.owner}/${dep.name} for ${packageKey}`
      );
    }
  }
  return allDepsLoaded;
};
var loadAutoloadPackages = async (db) => {
  const autoloadPath = path.join(
    path.dirname(__dirname),
    "db",
    "autoload-packages.json"
  );
  if (!fs.existsSync(autoloadPath)) {
    console.error("[autoload-dev-pkgs] \u274C No autoload-packages.json found");
    return;
  }
  const autoloadContent = JSON.parse(fs.readFileSync(autoloadPath, "utf8"));
  const loadedPackages = /* @__PURE__ */ new Set();
  let successCount = 0;
  let failureCount = 0;
  for (const packageRef of autoloadContent.packages) {
    const success = await loadPackageWithDependencies(
      db,
      packageRef.owner,
      packageRef.name,
      loadedPackages
    );
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  console.log(`
[autoload-dev-pkgs] \u{1F4CB} Package loading complete:`);
  console.log(
    `[autoload-dev-pkgs] \u2705 Successfully loaded: ${successCount} packages`
  );
  if (failureCount > 0) {
    console.log(
      `[autoload-dev-pkgs] \u274C Failed to load: ${failureCount} packages`
    );
  }
};

// fake-snippets-api/lib/db/seed.ts
var __dirname2 = dirname(fileURLToPath(import.meta.url));
var seed = (db) => {
  const { account_id } = db.addAccount({
    account_id: "account-1234",
    personal_org_id: "org-1234",
    github_username: "testuser",
    tscircuit_handle: "testuser",
    email: "testuser@tscircuit.com",
    shippingInfo: {
      firstName: "Test",
      lastName: "User",
      companyName: "Test Company",
      address: "123 Test St",
      apartment: "Apt 4B",
      city: "Testville",
      state: "NY",
      zipCode: "10001",
      country: "United States of America",
      phone: "555-123-4567"
    }
  });
  const seveibarAcc = db.addAccount({
    github_username: "seveibar",
    tscircuit_handle: "seveibar",
    email: "example@tscircuit.com"
  });
  db.githubInstallations.push({
    github_installation_id: "1234567890",
    account_id,
    installation_id: "1234567890",
    github_username: "testuser",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_active: true
  });
  if (process.env.AUTOLOAD_PACKAGES === "true") {
    loadAutoloadPackages(db);
  }
  const { package_release_id: packageReleaseId1 } = db.addSnippet({
    name: "testuser/my-test-board",
    unscoped_name: "my-test-board",
    github_repo_full_name: "testuser/my-test-board",
    owner_name: "testuser",
    branch_name: "main",
    commit_message: "Attempted build of a555timer-square-wave package",
    commit_author: "testuser",
    creator_account_id: account_id,
    code: `
import { A555Timer } from "@tsci/seveibar.a555timer"

export default () => (
  <board width="10mm" height="10mm">
    <A555Timer name="U1" />
  </board>
)`.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    snippet_type: "board",
    description: "A simple board with an A555 Timer component",
    circuit_json: [
      {
        type: "source_port",
        source_port_id: "source_port_0",
        name: "pin1",
        pin_number: 1,
        port_hints: ["pin1", "1"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_1",
        name: "pin2",
        pin_number: 2,
        port_hints: ["pin2", "2"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_2",
        name: "pin3",
        pin_number: 3,
        port_hints: ["pin3", "3"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_3",
        name: "pin4",
        pin_number: 4,
        port_hints: ["pin4", "4"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_4",
        name: "pin5",
        pin_number: 5,
        port_hints: ["pin5", "5"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_5",
        name: "pin6",
        pin_number: 6,
        port_hints: ["pin6", "6"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_6",
        name: "pin7",
        pin_number: 7,
        port_hints: ["pin7", "7"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_7",
        name: "pin8",
        pin_number: 8,
        port_hints: ["pin8", "8"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_chip",
        name: "U1",
        supplier_part_numbers: {}
      },
      {
        type: "schematic_component",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0,
          y: 0
        },
        rotation: 0,
        size: {
          width: 1.1,
          height: 1
        },
        pin_spacing: 0.2,
        port_labels: {},
        source_component_id: "source_component_0"
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_0",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_0",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 1,
        true_ccw_index: 0
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_1",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.10000000000000003
        },
        source_port_id: "source_port_1",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 2,
        true_ccw_index: 1
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_2",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.09999999999999998
        },
        source_port_id: "source_port_2",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 3,
        true_ccw_index: 2
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_3",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_3",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 4,
        true_ccw_index: 3
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_4",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_4",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 5,
        true_ccw_index: 4
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_5",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.10000000000000003
        },
        source_port_id: "source_port_5",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 6,
        true_ccw_index: 5
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_6",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.09999999999999998
        },
        source_port_id: "source_port_6",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 7,
        true_ccw_index: 6
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_7",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_7",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 8,
        true_ccw_index: 7
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_component_0",
        center: {
          x: 0,
          y: 0
        },
        width: 8.82,
        height: 8.82,
        layer: "top",
        rotation: 0,
        source_component_id: "source_component_0"
      },
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_0",
        center: {
          x: 0,
          y: 0
        },
        thickness: 1.4,
        num_layers: 4,
        width: 10,
        height: 10
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_0",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_0",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["1"],
        x: -3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_1",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_1",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["2"],
        x: -3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_2",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_2",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["3"],
        x: -3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_3",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_3",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["4"],
        x: -3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_4",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_4",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["5"],
        x: 3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_5",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_5",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["6"],
        x: 3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_6",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_6",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["7"],
        x: 3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_7",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_7",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["8"],
        x: 3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_0",
        pcb_component_id: "pcb_component_0",
        layer: "top",
        route: [
          {
            x: -3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: 4.61
          },
          {
            x: -1.0033333333333332,
            y: 4.61
          },
          {
            x: -0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: -0.7094638037905026,
            y: 3.9005361962094978
          },
          {
            x: -0.3839590438063067,
            y: 3.6830408690470096
          },
          {
            x: 6143644775722556e-32,
            y: 3.6066666666666674
          },
          {
            x: 0.38395904380630674,
            y: 3.6830408690470096
          },
          {
            x: 0.7094638037905027,
            y: 3.9005361962094978
          },
          {
            x: 0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: 1.0033333333333332,
            y: 4.61
          },
          {
            x: 3.01,
            y: 4.61
          },
          {
            x: 3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: -4.61
          }
        ],
        stroke_width: 0.1
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_0",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 3.81,
        source_port_id: "source_port_0"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_1",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 1.27,
        source_port_id: "source_port_1"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_2",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -1.27,
        source_port_id: "source_port_2"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_3",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -3.81,
        source_port_id: "source_port_3"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_4",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -3.81,
        source_port_id: "source_port_4"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_5",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -1.27,
        source_port_id: "source_port_5"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_6",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 1.27,
        source_port_id: "source_port_6"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_7",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 3.81,
        source_port_id: "source_port_7"
      },
      {
        type: "cad_component",
        cad_component_id: "cad_component_0",
        position: {
          x: 0,
          y: 0,
          z: 0.7
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0
        },
        pcb_component_id: "pcb_component_0",
        source_component_id: "source_component_0",
        footprinter_string: "dip8"
      }
    ]
  });
  const firstBuild = db.addPackageBuild({
    package_release_id: packageReleaseId1,
    created_at: new Date(Date.now() - 15e3).toISOString(),
    // 15 seconds ago
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 15e3).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 14e3).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[ERROR] Failed to parse TypeScript definitions",
      "[ERROR] Invalid syntax in component declaration"
    ],
    transpilation_error: "TypeScript compilation failed: Syntax error in component declaration",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: "Build cancelled due to transpilation failure",
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 15e3).toISOString(),
    build_completed_at: new Date(Date.now() - 14e3).toISOString(),
    build_error: "Build failed: Unable to complete transpilation step",
    build_error_last_updated_at: new Date(Date.now() - 14e3).toISOString(),
    package_build_website_url: null,
    build_logs: "Build process:\n1. Environment setup - OK\n2. Dependency resolution - OK\n3. Code compilation - FAILED\nError: Invalid syntax in component declaration\nBuild terminated with errors"
  });
  const release1 = db.getPackageReleaseById(packageReleaseId1);
  db.updatePackageRelease({
    ...release1,
    latest_package_build_id: firstBuild.package_build_id
  });
  const test2Package = db.addPackage({
    name: "testuser/test2-package",
    unscoped_name: "test2-package",
    creator_account_id: account_id,
    org_owner_tscircuit_handle: "testuser",
    owner_org_id: "org-1234",
    owner_github_username: "testuser",
    description: "A test package for development",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: "0.0.5",
    latest_version: "0.0.5",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 10,
    ai_description: "A comprehensive test package designed for development and testing purposes. This package includes various components and utilities commonly used in circuit design and simulation workflows.",
    ai_usage_instructions: "Import the package using `import { TestComponent } from '@tsci/testuser.test2-package'`. Use the TestComponent in your circuit designs by providing the required props. Example: `<TestComponent name='my-test' value={42} />`",
    default_view: "files",
    latest_pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    latest_cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    latest_sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`
  });
  db.updatePackage(test2Package.package_id, {
    github_repo_full_name: "testuser/test2-package",
    github_installation_id: "1234567890"
  });
  const { package_release_id: test2PackageReleaseId } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.1",
    created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId,
    file_path: "index.tsx",
    content_text: `
export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="10k" />
)
`.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId,
    file_path: "/dist/circuit.json",
    content_text: `[
  {
    "type": "source_project_metadata",
    "source_project_metadata_id": "source_project_metadata_0",
    "software_used_string": "@tscircuit/core@0.0.813"
  },
  {
    "type": "source_group",
    "source_group_id": "source_group_0",
    "is_subcircuit": true,
    "was_automatically_named": true,
    "subcircuit_id": "subcircuit_source_group_0"
  },
  {
    "type": "source_board",
    "source_board_id": "source_board_0",
    "source_group_id": "source_group_0"
  },
  {
    "type": "schematic_group",
    "schematic_group_id": "schematic_group_0",
    "is_subcircuit": true,
    "subcircuit_id": "subcircuit_source_group_0",
    "name": "unnamed_board1",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 0,
    "height": 0,
    "schematic_component_ids": [],
    "source_group_id": "source_group_0"
  },
  {
    "type": "pcb_board",
    "pcb_board_id": "pcb_board_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "thickness": 1.4,
    "num_layers": 2,
    "width": 10,
    "height": 10,
    "material": "fr4"
  }
]`.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageBuild({
    package_release_id: test2PackageReleaseId,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5e3).toISOString(),
    // Started 5 seconds ago
    transpilation_completed_at: new Date(Date.now() - 3e3).toISOString(),
    // Completed 3 seconds ago
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Generating TypeScript definitions",
      "[INFO] Compiling to JavaScript",
      "[SUCCESS] Transpilation completed successfully"
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3e3).toISOString(),
    // Started after transpilation
    circuit_json_build_completed_at: new Date(Date.now() - 1e3).toISOString(),
    // Completed 1 second ago
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Analyzing component structure",
      "[INFO] Generating port configurations",
      "[INFO] Validating circuit connections",
      "[SUCCESS] Circuit JSON build completed"
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1e4).toISOString(),
    // Started 10 seconds ago
    build_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    // Just completed
    build_error: null,
    build_error_last_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    build_logs: "Build process:\n1. Environment setup - OK\n2. Dependency resolution - OK\n3. Code compilation - OK\n4. Circuit validation - OK\n5. Package assembly - OK\nBuild completed successfully"
  });
  const { package_release_id: test2PackageReleaseId2 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.2",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId2,
    file_path: "index.tsx",
    content_text: `export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="20k" />
)`,
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId2,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\``,
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    is_text: true
  });
  const { package_release_id: test2PackageReleaseId3 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.3",
    created_at: new Date(Date.now() - 864e5).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "index.tsx",
    content_text: `import { formatResistance } from "./utils"

export const TestComponent = ({ name, value = 30 }: { name: string; value?: number }) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: new Date(Date.now() - 864e5).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 30`,
    created_at: new Date(Date.now() - 864e5).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.3

Added value prop support.`,
    created_at: new Date(Date.now() - 864e5).toISOString(),
    is_text: true
  });
  const { package_release_id: test2PackageReleaseIdPr1, ...d } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.4-pr1-ead7df70",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    is_pr_preview: true,
    pr_number: 1,
    pr_title: "feat: add new resistor values",
    branch_name: "feature/new-resistor-values",
    commit_sha: "259fbcd1f9e41cbe769c6f0b01cb2d86a9294668"
  });
  const { package_release_id: test2PackageReleaseId4 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.5",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({
  name,
  value = DEFAULT_RESISTANCE,
}: ComponentProps) => (
  <board width="10mm" height="10mm">
    <resistor
      footprint="0402"
      name={name}
      resistance={formatResistance(value)}
    />
  </board>
)`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 40`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.4

Latest version with TypeScript types.

## Usage
\`\`\`tsx
import { TestComponent } from "@tsci/testuser.test2-package"

<TestComponent name="R1" value={40} />
\`\`\``,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "dist/index/circuit.json",
    content_text: JSON.stringify([
      {
        type: "source_project_metadata",
        source_project_metadata_id: "source_project_metadata_0",
        software_used_string: "@tscircuit/core@0.0.1065"
      },
      {
        type: "source_group",
        source_group_id: "source_group_0",
        is_subcircuit: true,
        was_automatically_named: true,
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_0",
        name: "pin1",
        pin_number: 1,
        port_hints: ["pin1", "anode", "pos", "left", "1"],
        source_component_id: "source_component_0",
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_1",
        name: "pin2",
        pin_number: 2,
        port_hints: ["pin2", "cathode", "neg", "right", "2"],
        source_component_id: "source_component_0",
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_resistor",
        name: "unnamed_resistor1",
        supplier_part_numbers: { jlcpcb: [] },
        resistance: 4e4,
        display_resistance: "40k\u03A9",
        are_pins_interchangeable: true,
        source_group_id: "source_group_0"
      },
      {
        type: "source_board",
        source_board_id: "source_board_0",
        source_group_id: "source_group_0"
      },
      {
        type: "source_pin_missing_trace_warning",
        source_pin_missing_trace_warning_id: "source_pin_missing_trace_warning_0",
        message: "Port pin1 on undefined is missing a trace",
        source_component_id: "source_component_0",
        source_port_id: "source_port_0",
        subcircuit_id: "subcircuit_source_group_0",
        warning_type: "source_pin_missing_trace_warning"
      },
      {
        type: "source_pin_missing_trace_warning",
        source_pin_missing_trace_warning_id: "source_pin_missing_trace_warning_1",
        message: "Port pin2 on undefined is missing a trace",
        source_component_id: "source_component_0",
        source_port_id: "source_port_1",
        subcircuit_id: "subcircuit_source_group_0",
        warning_type: "source_pin_missing_trace_warning"
      },
      {
        type: "schematic_component",
        schematic_component_id: "schematic_component_0",
        center: { x: 0, y: 0 },
        size: { width: 1.1, height: 0.388910699999999 },
        source_component_id: "source_component_0",
        is_box_with_pins: true,
        symbol_name: "boxresistor_right",
        symbol_display_value: "40k\u03A9",
        schematic_group_id: "schematic_group_0"
      },
      {
        type: "schematic_group",
        schematic_group_id: "schematic_group_0",
        is_subcircuit: true,
        subcircuit_id: "subcircuit_source_group_0",
        name: "unnamed_board1",
        center: { x: 0, y: 0 },
        width: 0,
        height: 0,
        schematic_component_ids: [],
        source_group_id: "source_group_0"
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_0",
        schematic_component_id: "schematic_component_0",
        center: { x: -0.55, y: 0 },
        source_port_id: "source_port_0",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        pin_number: 1,
        display_pin_label: "anode",
        is_connected: false
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_1",
        schematic_component_id: "schematic_component_0",
        center: { x: 0.55, y: 0 },
        source_port_id: "source_port_1",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        pin_number: 2,
        display_pin_label: "cathode",
        is_connected: false
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_component_0",
        center: { x: 0, y: 0 },
        width: 1.56,
        height: 0.64,
        layer: "top",
        rotation: 0,
        source_component_id: "source_component_0",
        subcircuit_id: "subcircuit_source_group_0",
        do_not_place: false,
        obstructs_within_bounds: true
      },
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_0",
        source_board_id: "source_board_0",
        center: { x: 0, y: 0 },
        thickness: 1.4,
        num_layers: 2,
        width: 10,
        height: 10,
        material: "fr4"
      },
      {
        type: "pcb_smtpad",
        pcb_smtpad_id: "pcb_smtpad_0",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_0",
        layer: "top",
        shape: "rect",
        width: 0.54,
        height: 0.64,
        port_hints: ["1", "left"],
        is_covered_with_solder_mask: false,
        x: -0.51,
        y: 0,
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_solder_paste",
        pcb_solder_paste_id: "pcb_solder_paste_0",
        layer: "top",
        shape: "rect",
        width: 0.378,
        height: 0.44799999999999995,
        x: -0.51,
        y: 0,
        pcb_component_id: "pcb_component_0",
        pcb_smtpad_id: "pcb_smtpad_0",
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_smtpad",
        pcb_smtpad_id: "pcb_smtpad_1",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_1",
        layer: "top",
        shape: "rect",
        width: 0.54,
        height: 0.64,
        port_hints: ["2", "right"],
        is_covered_with_solder_mask: false,
        x: 0.51,
        y: 0,
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_solder_paste",
        pcb_solder_paste_id: "pcb_solder_paste_1",
        layer: "top",
        shape: "rect",
        width: 0.378,
        height: 0.44799999999999995,
        x: 0.51,
        y: 0,
        pcb_component_id: "pcb_component_0",
        pcb_smtpad_id: "pcb_smtpad_1",
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_0",
        pcb_component_id: "pcb_component_0",
        layer: "top",
        route: [
          { x: 0.51, y: 0.72 },
          { x: -0.98, y: 0.72 },
          { x: -0.98, y: -0.72 },
          { x: 0.51, y: -0.72 }
        ],
        stroke_width: 0.1,
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: "pcb_silkscreen_text_0",
        anchor_alignment: "center",
        anchor_position: { x: 0, y: 1.22 },
        font: "tscircuit2024",
        font_size: 0.4,
        layer: "top",
        text: "Resistor",
        ccw_rotation: 0,
        pcb_component_id: "pcb_component_0",
        subcircuit_id: "subcircuit_source_group_0"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_0",
        pcb_component_id: "pcb_component_0",
        layers: ["top"],
        subcircuit_id: "subcircuit_source_group_0",
        x: -0.51,
        y: 0,
        source_port_id: "source_port_0"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_1",
        pcb_component_id: "pcb_component_0",
        layers: ["top"],
        subcircuit_id: "subcircuit_source_group_0",
        x: 0.51,
        y: 0,
        source_port_id: "source_port_1"
      },
      {
        type: "cad_component",
        cad_component_id: "cad_component_0",
        position: { x: 0, y: 0, z: 0.7 },
        rotation: { x: 0, y: 0, z: 0 },
        pcb_component_id: "pcb_component_0",
        source_component_id: "source_component_0",
        footprinter_string: "0402"
      }
    ]),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({ name, value = DEFAULT_RESISTANCE }: ComponentProps) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 50`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  const { package_release_id: test2PackageReleaseId5 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.6",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({
  name,
  value = DEFAULT_RESISTANCE,
}: ComponentProps) => (
  <board width="10mm" height="10mm">
    <resistor
      footprint="0402"
      name={name}
      resistance={formatResistance(value)}
    />
  </board>
)`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 50`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.6

Unreleased version - not marked as latest.

## Usage
\`\`\`tsx
import { TestComponent } from "@tsci/testuser.test2-package"

<TestComponent name="R1" value={50} />
\`\`\``,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.updatePackage(test2Package.package_id, {
    latest_package_release_id: test2PackageReleaseId4
  });
  db.addPackageDomain({
    points_to: "package_release",
    package_release_id: test2PackageReleaseId4,
    package_id: test2Package.package_id,
    fully_qualified_domain_name: "test2-package.tscircuit.app"
  });
  db.addPackageDomain({
    points_to: "package_release",
    package_release_id: test2PackageReleaseId4,
    package_id: test2Package.package_id,
    fully_qualified_domain_name: "my-board-preview.tscircuit.app"
  });
  db.addSnippet({
    name: "seveibar/a555timer",
    unscoped_name: "a555timer",
    owner_name: "seveibar",
    code: `
export const A555Timer = ({ name }: { name: string }) => (
  <chip name={name} footprint="dip8" />
)
`.trim(),
    dts: `
declare module "@tsci/seveibar.a555timer" {
  export const A555Timer: ({ name }: {
    name: string;
  }) => any;
}
`.trim(),
    compiled_js: `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.A555Timer = void 0;
const A555Timer = ({
  name
}) => /*#__PURE__*/React.createElement("chip", {
  name: name,
  footprint: "dip8"
});
exports.A555Timer = A555Timer;
    `.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    snippet_type: "package",
    description: "A simple package with an A555 Timer component",
    circuit_json: [
      {
        type: "source_port",
        source_port_id: "source_port_0",
        name: "pin1",
        pin_number: 1,
        port_hints: ["pin1", "1"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_1",
        name: "pin2",
        pin_number: 2,
        port_hints: ["pin2", "2"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_2",
        name: "pin3",
        pin_number: 3,
        port_hints: ["pin3", "3"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_3",
        name: "pin4",
        pin_number: 4,
        port_hints: ["pin4", "4"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_4",
        name: "pin5",
        pin_number: 5,
        port_hints: ["pin5", "5"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_5",
        name: "pin6",
        pin_number: 6,
        port_hints: ["pin6", "6"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_6",
        name: "pin7",
        pin_number: 7,
        port_hints: ["pin7", "7"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_7",
        name: "pin8",
        pin_number: 8,
        port_hints: ["pin8", "8"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_chip",
        name: "U1"
      },
      {
        type: "schematic_component",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0,
          y: 0
        },
        rotation: 0,
        size: {
          width: 1.1,
          height: 1
        },
        pin_spacing: 0.2,
        port_labels: {},
        source_component_id: "source_component_0"
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_0",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_0",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 1,
        true_ccw_index: 0
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_1",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.10000000000000003
        },
        source_port_id: "source_port_1",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 2,
        true_ccw_index: 1
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_2",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.09999999999999998
        },
        source_port_id: "source_port_2",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 3,
        true_ccw_index: 2
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_3",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_3",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 4,
        true_ccw_index: 3
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_4",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_4",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 5,
        true_ccw_index: 4
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_5",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.10000000000000003
        },
        source_port_id: "source_port_5",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 6,
        true_ccw_index: 5
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_6",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.09999999999999998
        },
        source_port_id: "source_port_6",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 7,
        true_ccw_index: 6
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_7",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_7",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 8,
        true_ccw_index: 7
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_component_0",
        center: {
          x: 0,
          y: 0
        },
        width: 8.82,
        height: 8.82,
        layer: "top",
        rotation: 0,
        source_component_id: "source_component_0"
      },
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_0",
        center: {
          x: 0,
          y: 0
        },
        thickness: 1.4,
        num_layers: 4,
        width: 50,
        height: 50
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_0",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_0",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["1"],
        x: -3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_1",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_1",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["2"],
        x: -3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_2",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_2",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["3"],
        x: -3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_3",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_3",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["4"],
        x: -3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_4",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_4",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["5"],
        x: 3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_5",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_5",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["6"],
        x: 3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_6",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_6",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["7"],
        x: 3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_7",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_7",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["8"],
        x: 3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_0",
        pcb_component_id: "pcb_component_0",
        layer: "top",
        route: [
          {
            x: -3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: 4.61
          },
          {
            x: -1.0033333333333332,
            y: 4.61
          },
          {
            x: -0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: -0.7094638037905026,
            y: 3.9005361962094978
          },
          {
            x: -0.3839590438063067,
            y: 3.6830408690470096
          },
          {
            x: 6143644775722556e-32,
            y: 3.6066666666666674
          },
          {
            x: 0.38395904380630674,
            y: 3.6830408690470096
          },
          {
            x: 0.7094638037905027,
            y: 3.9005361962094978
          },
          {
            x: 0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: 1.0033333333333332,
            y: 4.61
          },
          {
            x: 3.01,
            y: 4.61
          },
          {
            x: 3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: -4.61
          }
        ],
        stroke_width: 0.1
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_0",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 3.81,
        source_port_id: "source_port_0"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_1",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 1.27,
        source_port_id: "source_port_1"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_2",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -1.27,
        source_port_id: "source_port_2"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_3",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -3.81,
        source_port_id: "source_port_3"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_4",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -3.81,
        source_port_id: "source_port_4"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_5",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -1.27,
        source_port_id: "source_port_5"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_6",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 1.27,
        source_port_id: "source_port_6"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_7",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 3.81,
        source_port_id: "source_port_7"
      },
      {
        type: "cad_component",
        cad_component_id: "cad_component_0",
        position: {
          x: 0,
          y: 0,
          z: 0.7
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0
        },
        pcb_component_id: "pcb_component_0",
        source_component_id: "source_component_0",
        footprinter_string: "dip8"
      }
    ]
  });
  const { package_release_id: packageReleaseId2 } = db.addSnippet({
    name: "testuser/a555timer-square-wave",
    unscoped_name: "a555timer-square-wave",
    owner_name: "testuser",
    branch_name: "main",
    commit_message: "Attempted build of a555timer-square-wave package",
    commit_author: "testuser",
    creator_account_id: account_id,
    code: `
import { A555Timer } from "@tsci/seveibar.a555timer"

export const SquareWaveModule = () => (
  <A555Timer name="U1" />
)
`.trim(),
    dts: 'export declare const SquareWaveModule: () => import("react/jsx-runtime").JSX.Element;\n',
    compiled_js: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.SquareWaveModule = void 0;\nvar _seveibar = require("@tsci/seveibar.a555timer");\nconst SquareWaveModule = () => /*#__PURE__*/React.createElement(_seveibar.A555Timer, {\n  name: "U1"\n});\nexports.SquareWaveModule = SquareWaveModule;',
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    snippet_type: "package",
    github_repo_full_name: "testuser/test",
    description: "A simple package that outputs a square waveform using the a555timer",
    circuit_json: [
      {
        type: "source_port",
        source_port_id: "source_port_0",
        name: "pin1",
        pin_number: 1,
        port_hints: ["pin1", "1"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_1",
        name: "pin2",
        pin_number: 2,
        port_hints: ["pin2", "2"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_2",
        name: "pin3",
        pin_number: 3,
        port_hints: ["pin3", "3"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_3",
        name: "pin4",
        pin_number: 4,
        port_hints: ["pin4", "4"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_4",
        name: "pin5",
        pin_number: 5,
        port_hints: ["pin5", "5"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_5",
        name: "pin6",
        pin_number: 6,
        port_hints: ["pin6", "6"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_6",
        name: "pin7",
        pin_number: 7,
        port_hints: ["pin7", "7"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_port",
        source_port_id: "source_port_7",
        name: "pin8",
        pin_number: 8,
        port_hints: ["pin8", "8"],
        source_component_id: "source_component_0"
      },
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_chip",
        name: "U1"
      },
      {
        type: "schematic_component",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0,
          y: 0
        },
        rotation: 0,
        size: {
          width: 1.1,
          height: 1
        },
        pin_spacing: 0.2,
        port_labels: {},
        source_component_id: "source_component_0"
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_0",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_0",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 1,
        true_ccw_index: 0
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_1",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.10000000000000003
        },
        source_port_id: "source_port_1",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 2,
        true_ccw_index: 1
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_2",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.09999999999999998
        },
        source_port_id: "source_port_2",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 3,
        true_ccw_index: 2
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_3",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_3",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 4,
        true_ccw_index: 3
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_4",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.30000000000000004
        },
        source_port_id: "source_port_4",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 5,
        true_ccw_index: 4
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_5",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.10000000000000003
        },
        source_port_id: "source_port_5",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 6,
        true_ccw_index: 5
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_6",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.09999999999999998
        },
        source_port_id: "source_port_6",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 7,
        true_ccw_index: 6
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_7",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.30000000000000004
        },
        source_port_id: "source_port_7",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 8,
        true_ccw_index: 7
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_component_0",
        center: {
          x: 0,
          y: 0
        },
        width: 8.82,
        height: 8.82,
        layer: "top",
        rotation: 0,
        source_component_id: "source_component_0"
      },
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_0",
        center: {
          x: 0,
          y: 0
        },
        thickness: 1.4,
        num_layers: 4,
        width: 50,
        height: 50
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_0",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_0",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["1"],
        x: -3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_1",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_1",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["2"],
        x: -3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_2",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_2",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["3"],
        x: -3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_3",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_3",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["4"],
        x: -3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_4",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_4",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["5"],
        x: 3.81,
        y: -3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_5",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_5",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["6"],
        x: 3.81,
        y: -1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_6",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_6",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["7"],
        x: 3.81,
        y: 1.27,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_7",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_7",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["8"],
        x: 3.81,
        y: 3.81,
        layers: ["top", "bottom"]
      },
      {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_0",
        pcb_component_id: "pcb_component_0",
        layer: "top",
        route: [
          {
            x: -3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: 4.61
          },
          {
            x: -1.0033333333333332,
            y: 4.61
          },
          {
            x: -0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: -0.7094638037905026,
            y: 3.9005361962094978
          },
          {
            x: -0.3839590438063067,
            y: 3.6830408690470096
          },
          {
            x: 6143644775722556e-32,
            y: 3.6066666666666674
          },
          {
            x: 0.38395904380630674,
            y: 3.6830408690470096
          },
          {
            x: 0.7094638037905027,
            y: 3.9005361962094978
          },
          {
            x: 0.9269591309529909,
            y: 4.226040956193693
          },
          {
            x: 1.0033333333333332,
            y: 4.61
          },
          {
            x: 3.01,
            y: 4.61
          },
          {
            x: 3.01,
            y: -4.61
          },
          {
            x: -3.01,
            y: -4.61
          }
        ],
        stroke_width: 0.1
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_0",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 3.81,
        source_port_id: "source_port_0"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_1",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 1.27,
        source_port_id: "source_port_1"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_2",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -1.27,
        source_port_id: "source_port_2"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_3",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -3.81,
        source_port_id: "source_port_3"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_4",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -3.81,
        source_port_id: "source_port_4"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_5",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -1.27,
        source_port_id: "source_port_5"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_6",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 1.27,
        source_port_id: "source_port_6"
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_7",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 3.81,
        source_port_id: "source_port_7"
      },
      {
        type: "cad_component",
        cad_component_id: "cad_component_0",
        position: {
          x: 0,
          y: 0,
          z: 0.7
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0
        },
        pcb_component_id: "pcb_component_0",
        source_component_id: "source_component_0",
        footprinter_string: "dip8"
      }
    ]
  });
  const failedBuild = db.addPackageBuild({
    package_release_id: packageReleaseId2,
    created_at: new Date(Date.now() - 15e3).toISOString(),
    // 15 seconds ago
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 15e3).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 14e3).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[ERROR] Failed to parse TypeScript definitions",
      "[ERROR] Invalid syntax in component declaration"
    ],
    transpilation_error: "TypeScript compilation failed: Syntax error in component declaration",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: "Build cancelled due to transpilation failure",
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 15e3).toISOString(),
    build_completed_at: new Date(Date.now() - 14e3).toISOString(),
    build_error: "Build failed: Unable to complete transpilation step",
    build_error_last_updated_at: new Date(Date.now() - 14e3).toISOString(),
    package_build_website_url: null,
    build_logs: "Build process:\n1. Environment setup - OK\n2. Dependency resolution - OK\n3. Code compilation - FAILED\nError: Invalid syntax in component declaration\nBuild terminated with errors"
  });
  const successfulBuild = db.addPackageBuild({
    package_release_id: packageReleaseId2,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5e3).toISOString(),
    // Started 5 seconds ago
    transpilation_completed_at: new Date(Date.now() - 3e3).toISOString(),
    // Completed 3 seconds ago
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Generating TypeScript definitions",
      "[INFO] Compiling to JavaScript",
      "[SUCCESS] Transpilation completed successfully"
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3e3).toISOString(),
    // Started after transpilation
    circuit_json_build_completed_at: new Date(Date.now() - 1e3).toISOString(),
    // Completed 1 second ago
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Analyzing component structure",
      "[INFO] Generating port configurations",
      "[INFO] Validating circuit connections",
      "[SUCCESS] Circuit JSON build completed"
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1e4).toISOString(),
    // Started 10 seconds ago
    build_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    // Just completed
    build_error: null,
    build_error_last_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    package_build_website_url: "http://localhost:3000/preview/package_build_1",
    build_logs: "Build process:\n1. Environment setup - OK\n2. Dependency resolution - OK\n3. Code compilation - OK\n4. Circuit validation - OK\n5. Package assembly - OK\nBuild completed successfully"
  });
  const release2 = db.getPackageReleaseById(packageReleaseId2);
  db.updatePackageRelease({
    ...release2,
    latest_package_build_id: successfulBuild.package_build_id
  });
  db.addOrder({
    account_id,
    is_running: false,
    is_started: false,
    is_finished: false,
    error: null,
    has_error: false,
    circuit_json: [
      {
        type: "source_component",
        ftype: "simple_resistor",
        source_component_id: "source_component_1",
        name: "R1",
        resistane: "1k"
      }
    ],
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    started_at: null,
    completed_at: null
  });
  const testOrg = db.addOrganization({
    org_display_name: "Test Organization",
    tscircuit_handle: "test-organization",
    github_handle: "tscircuit",
    owner_account_id: account_id,
    org_id: "org-test-1234"
  });
  db.addOrganizationAccount({
    org_id: testOrg.org_id,
    account_id,
    is_owner: true
  });
  const testOrgPackage = db.addPackage({
    name: "test-organization/test-org-package",
    unscoped_name: "test-org-package",
    creator_account_id: account_id,
    owner_org_id: testOrg.org_id,
    owner_github_username: testOrg.github_handle,
    description: "A test package for development",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: null,
    latest_version: "0.0.1",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 10,
    ai_description: "A comprehensive test package designed for development and testing purposes. This package includes various components and utilities commonly used in circuit design and simulation workflows.",
    ai_usage_instructions: "Import the package using `import { TestComponent } from '@tsci/test-organization.test-org-package'`. Use the TestComponent in your circuit designs by providing the required props. Example: `<TestComponent name='my-test' value={42} />`",
    default_view: "files",
    latest_pcb_preview_image_url: `/api/packages/images/test-organization/test-org-package/pcb.png`,
    latest_cad_preview_image_url: `/api/packages/images/test-organization/test-org-package/3d.png`,
    latest_sch_preview_image_url: `/api/packages/images/test-organization/test-org-package/schematic.png`
  });
  const { package_release_id: testOrgPackageReleaseId } = db.addPackageRelease({
    package_id: testOrgPackage.package_id,
    version: "0.0.1",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    pcb_preview_image_url: `/api/packages/images/test-organization/test-org-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/test-organization/test-org-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/test-organization/test-org-package/schematic.png`
  });
  db.addPackageFile({
    package_release_id: testOrgPackageReleaseId,
    file_path: "index.tsx",
    content_text: `
    export const TestComponent = ({ name }: { name: string }) => (
      <resistor name={name} resistance="10k" />
    )
    `.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageFile({
    package_release_id: testOrgPackageReleaseId,
    file_path: "/dist/circuit.json",
    content_text: `[
      {
        "type": "source_project_metadata",
        "source_project_metadata_id": "source_project_metadata_0",
        "software_used_string": "@tscircuit/core@0.0.813"
      },
      {
        "type": "source_group",
        "source_group_id": "source_group_0",
        "is_subcircuit": true,
        "was_automatically_named": true,
        "subcircuit_id": "subcircuit_source_group_0"
      },
      {
        "type": "source_board",
        "source_board_id": "source_board_0",
        "source_group_id": "source_group_0"
      },
      {
        "type": "schematic_group",
        "schematic_group_id": "schematic_group_0",
        "is_subcircuit": true,
        "subcircuit_id": "subcircuit_source_group_0",
        "name": "unnamed_board1",
        "center": {
          "x": 0,
          "y": 0
        },
        "width": 0,
        "height": 0,
        "schematic_component_ids": [],
        "source_group_id": "source_group_0"
      },
      {
        "type": "pcb_board",
        "pcb_board_id": "pcb_board_0",
        "center": {
          "x": 0,
          "y": 0
        },
        "thickness": 1.4,
        "num_layers": 2,
        "width": 10,
        "height": 10,
        "material": "fr4"
      }
    ]`.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageBuild({
    package_release_id: testOrgPackageReleaseId,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5e3).toISOString(),
    // Started 5 seconds ago
    transpilation_completed_at: new Date(Date.now() - 3e3).toISOString(),
    // Completed 3 seconds ago
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Generating TypeScript definitions",
      "[INFO] Compiling to JavaScript",
      "[SUCCESS] Transpilation completed successfully"
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3e3).toISOString(),
    // Started after transpilation
    circuit_json_build_completed_at: new Date(Date.now() - 1e3).toISOString(),
    // Completed 1 second ago
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Analyzing component structure",
      "[INFO] Generating port configurations",
      "[INFO] Validating circuit connections",
      "[SUCCESS] Circuit JSON build completed"
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1e4).toISOString(),
    // Started 10 seconds ago
    build_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    // Just completed
    build_error: null,
    build_error_last_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    build_logs: "Build process:\n1. Environment setup - OK\n2. Dependency resolution - OK\n3. Code compilation - OK\n4. Circuit validation - OK\n5. Package assembly - OK\nBuild completed successfully"
  });
  const { package_release_id: orgPackageReleaseId } = db.addSnippet({
    name: "test-organization/test-package",
    unscoped_name: "test-package",
    owner_name: "test-organization",
    code: `
export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="10k" />
)
`.trim(),
    dts: `
declare module "@tsci/test-organization.test-package" {
  export const TestComponent: ({ name }: {
    name: string;
  }) => any;
}
`.trim(),
    compiled_js: `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestComponent = void 0;
const TestComponent = ({
  name
}) => /*#__PURE__*/React.createElement("resistor", {
  name: name,
  resistance: "10k"
});
exports.TestComponent = TestComponent;
    `.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    snippet_type: "package",
    description: "Test package for organization",
    circuit_json: [
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_resistor",
        name: "R1",
        resistance: "10k"
      }
    ]
  });
  const orgPackageBuild = db.addPackageBuild({
    package_release_id: orgPackageReleaseId,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5e3).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 3e3).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[SUCCESS] Transpilation completed successfully"
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3e3).toISOString(),
    circuit_json_build_completed_at: new Date(Date.now() - 1e3).toISOString(),
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[SUCCESS] Circuit JSON build completed"
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1e4).toISOString(),
    build_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    build_error: null,
    build_error_last_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    package_build_website_url: "http://localhost:3000/preview/org_package_build",
    build_logs: "Build completed successfully"
  });
  const orgRelease = db.getPackageReleaseById(orgPackageReleaseId);
  db.updatePackageRelease({
    ...orgRelease,
    latest_package_build_id: orgPackageBuild.package_build_id
  });
  db.addOrganization({
    name: "testuser",
    owner_account_id: account_id,
    github_handle: "tscircuit",
    is_personal_org: true,
    org_id: "org-1234"
  });
  db.addOrganizationAccount({
    org_id: "org-1234",
    account_id,
    is_owner: true
  });
  db.addOrganization({
    name: "seveibar",
    owner_account_id: seveibarAcc.account_id,
    github_handle: "seveibar",
    is_personal_org: true,
    org_id: "org-1235",
    avatar_url: "https://github.com/seveibar.png"
  });
  db.addOrganizationAccount({
    org_id: testOrg.org_id,
    account_id: seveibarAcc.account_id
  });
  const glbModelPackage = db.addPackage({
    name: "testuser/custom-3d-model",
    unscoped_name: "custom-3d-model",
    creator_account_id: account_id,
    owner_org_id: "org-1234",
    owner_github_username: "testuser",
    description: "A package demonstrating custom 3D CAD model usage",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: null,
    latest_version: "0.0.1",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 5,
    ai_description: "A package that demonstrates how to use custom 3D CAD models (GLB files) with tscircuit components.",
    ai_usage_instructions: "Import the default component and use it in your circuit design. The component includes a custom 3D model for visualization.",
    default_view: "3d"
  });
  const { package_release_id: glbModelReleaseId } = db.addPackageRelease({
    package_id: glbModelPackage.package_id,
    version: "0.0.1",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null
  });
  db.addPackageDomain({
    points_to: "package_release_with_tag",
    package_id: glbModelPackage.package_id,
    tag: "latest",
    fully_qualified_domain_name: "custom-3d-model.tscircuit.app"
  });
  db.updatePackage(glbModelPackage.package_id, {
    latest_package_release_id: glbModelReleaseId
  });
  db.addPackageFile({
    package_release_id: glbModelReleaseId,
    file_path: "index.tsx",
    content_text: `import glbUrl from "./test.glb"
export default () => (
  <board>
    <chip
      name="U1"
      cadModel={
        <cadassembly>
          <cadmodel
            modelUrl={glbUrl}
            modelUnitToMmScale={1000}
            positionOffset={{ x: 0, y: 0, z: 0.2 }}
          />
        </cadassembly>
      }
    />
  </board>
)`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  try {
    const glbFilePath = join(__dirname2, "assets", "test.glb");
    const glbFileContent = readFileSync(glbFilePath);
    db.addPackageFile({
      package_release_id: glbModelReleaseId,
      file_path: "test.glb",
      content_bytes: glbFileContent,
      content_mimetype: "model/gltf-binary",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      is_text: false
    });
  } catch {
  }
  db.addPackageFile({
    package_release_id: glbModelReleaseId,
    file_path: "dist/index/circuit.json",
    content_text: `[
  {
    "type": "source_project_metadata",
    "source_project_metadata_id": "source_project_metadata_0",
    "software_used_string": "@tscircuit/core@0.0.1013"
  },
  {
    "type": "source_group",
    "source_group_id": "source_group_0",
    "is_subcircuit": true,
    "was_automatically_named": true,
    "subcircuit_id": "subcircuit_source_group_0"
  },
  {
    "type": "source_component",
    "source_component_id": "source_component_0",
    "ftype": "simple_chip",
    "name": "U1",
    "supplier_part_numbers": {},
    "source_group_id": "source_group_0"
  },
  {
    "type": "source_board",
    "source_board_id": "source_board_0",
    "source_group_id": "source_group_0"
  },
  {
    "type": "schematic_component",
    "schematic_component_id": "schematic_component_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "rotation": 0,
    "size": {
      "width": 0.4,
      "height": 0.4
    },
    "pin_spacing": 0.2,
    "port_labels": {},
    "source_component_id": "source_component_0",
    "schematic_group_id": "schematic_group_0"
  },
  {
    "type": "schematic_text",
    "schematic_text_id": "schematic_text_0",
    "text": "",
    "schematic_component_id": "schematic_component_0",
    "anchor": "left",
    "rotation": 0,
    "position": {
      "x": -0.2,
      "y": -0.33
    },
    "color": "#006464",
    "font_size": 0.18
  },
  {
    "type": "schematic_text",
    "schematic_text_id": "schematic_text_1",
    "text": "U1",
    "schematic_component_id": "schematic_component_0",
    "anchor": "left",
    "rotation": 0,
    "position": {
      "x": -0.2,
      "y": 0.33
    },
    "color": "#006464",
    "font_size": 0.18
  },
  {
    "type": "schematic_group",
    "schematic_group_id": "schematic_group_0",
    "is_subcircuit": true,
    "subcircuit_id": "subcircuit_source_group_0",
    "name": "unnamed_board1",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 0,
    "height": 0,
    "schematic_component_ids": [],
    "source_group_id": "source_group_0"
  },
  {
    "type": "pcb_component",
    "pcb_component_id": "pcb_component_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 2,
    "height": 3,
    "layer": "top",
    "rotation": 0,
    "source_component_id": "source_component_0",
    "subcircuit_id": "subcircuit_source_group_0",
    "do_not_place": false,
    "obstructs_within_bounds": true
  },
  {
    "type": "pcb_board",
    "pcb_board_id": "pcb_board_0",
    "source_board_id": "source_board_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "thickness": 1.4,
    "num_layers": 2,
    "width": 6,
    "height": 7,
    "material": "fr4"
  },
  {
    "type": "cad_component",
    "cad_component_id": "cad_component_0",
    "position": {
      "x": 0,
      "y": 0,
      "z": 0.8999999999999999
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "pcb_component_id": "pcb_component_0",
    "source_component_id": "source_component_0",
    "model_unit_to_mm_scale_factor": 1000,
    "model_glb_url": "./test.glb"
  }
]`,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_text: true
  });
  db.addPackageBuild({
    package_release_id: glbModelReleaseId,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5e3).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 3e3).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Processing GLB asset file",
      "[INFO] Generating TypeScript definitions",
      "[SUCCESS] Transpilation completed successfully"
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3e3).toISOString(),
    circuit_json_build_completed_at: new Date(Date.now() - 1e3).toISOString(),
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Loading custom 3D model",
      "[INFO] Validating CAD assembly structure",
      "[SUCCESS] Circuit JSON build completed"
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 1e4).toISOString(),
    build_completed_at: (/* @__PURE__ */ new Date()).toISOString(),
    build_error: null,
    build_error_last_updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    build_logs: "Build process:\n1. Environment setup - OK\n2. Asset processing - OK\n3. Code compilation - OK\n4. 3D model validation - OK\nBuild completed successfully"
  });
  const { package_release_id: glbModelReleaseId2 } = db.addPackageRelease({
    package_id: glbModelPackage.package_id,
    version: "0.0.2",
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null
  });
};

// fake-snippets-api/lib/package_file/generate-fs-sha.ts
import md5 from "md5";
function generateFsSha(packageFiles) {
  const fsMap = {};
  packageFiles.filter((file) => file.content_text).forEach((file) => {
    fsMap[file.file_path] = file.content_text || "";
  });
  const hash = md5(JSON.stringify(fsMap));
  return `md5-${hash}`;
}

// fake-snippets-api/lib/db/db-client.ts
var createDatabase = ({ seed: seed2 } = {}) => {
  const db = hoist(createStore(initializer));
  if (seed2) {
    seed(db);
  }
  return db;
};
var initializer = combine(databaseSchema.parse({}), (set, get) => ({
  addOrder: (order) => {
    const newOrder = { order_id: `order_${get().idCounter + 1}`, ...order };
    set((state) => {
      return {
        orders: [...state.orders, newOrder],
        idCounter: state.idCounter + 1
      };
    });
    return newOrder;
  },
  getOrderById: (orderId) => {
    const state = get();
    return state.orders.find((order) => order.order_id === orderId);
  },
  getOrderFilesByOrderId: (orderId) => {
    const state = get();
    return state.orderFiles.filter((file) => file.order_id === orderId);
  },
  addOrderQuote: ({
    account_id,
    package_release_id,
    vendor_name
  }) => {
    const newOrderQuote = {
      order_quote_id: `order_quote_${get().idCounter + 1}`,
      account_id,
      package_release_id: package_release_id ?? null,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      completed_at: null,
      error: null,
      has_error: false,
      is_completed: false,
      is_processing: true,
      vendor_name,
      quoted_components: [],
      bare_pcb_cost: 0,
      shipping_options: [],
      total_cost_without_shipping: 0
    };
    set((state) => {
      return {
        orderQuotes: [...state.orderQuotes, newOrderQuote],
        idCounter: state.idCounter + 1
      };
    });
    return newOrderQuote.order_quote_id;
  },
  getOrderQuoteById: (orderQuoteId) => {
    const state = get();
    return state.orderQuotes.find(
      (quote) => quote.order_quote_id === orderQuoteId
    );
  },
  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map(
        (order) => order.order_id === orderId ? { ...order, ...updates } : order
      )
    }));
  },
  addOrderFile: (orderFile) => {
    const newOrderFile = {
      order_file_id: `order_file_${get().idCounter + 1}`,
      ...orderFile
    };
    set((state) => {
      return {
        orderFiles: [...state.orderFiles, newOrderFile],
        idCounter: state.idCounter + 1
      };
    });
    return newOrderFile;
  },
  getOrderFileById: (orderFileId) => {
    const state = get();
    return state.orderFiles.find((file) => file.order_file_id === orderFileId);
  },
  addBugReport: ({
    reporter_account_id,
    text,
    is_auto_deleted,
    delete_at
  }) => {
    const normalizedIsAutoDeleted = Boolean(is_auto_deleted);
    if (normalizedIsAutoDeleted && !delete_at) {
      throw new Error("delete_at is required when is_auto_deleted is true");
    }
    const normalizedDeleteAt = normalizedIsAutoDeleted ? delete_at ?? null : null;
    const bugReport = bugReportSchema.parse({
      bug_report_id: randomUUID(),
      reporter_account_id,
      text: text ?? null,
      is_auto_deleted: normalizedIsAutoDeleted,
      delete_at: normalizedDeleteAt,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      file_count: 0
    });
    set((state) => ({
      bugReports: [...state.bugReports, bugReport]
    }));
    return bugReport;
  },
  getBugReportById: (bugReportId) => {
    const state = get();
    return state.bugReports.find(
      (bugReport) => bugReport.bug_report_id === bugReportId
    );
  },
  addBugReportFile: ({
    bug_report_id,
    file_path,
    content_mimetype,
    is_text,
    content_text,
    content_bytes
  }) => {
    const bugReportFile = bugReportFileSchema.parse({
      bug_report_file_id: randomUUID(),
      bug_report_id,
      file_path,
      content_mimetype,
      is_text,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      content_text,
      content_bytes
    });
    set((state) => ({
      bugReportFiles: [...state.bugReportFiles, bugReportFile],
      bugReports: state.bugReports.map(
        (bugReport) => bugReport.bug_report_id === bug_report_id ? { ...bugReport, file_count: bugReport.file_count + 1 } : bugReport
      )
    }));
    return bugReportFile;
  },
  getBugReportFilesByBugReportId: (bugReportId) => {
    const state = get();
    return state.bugReportFiles.filter(
      (file) => file.bug_report_id === bugReportId
    );
  },
  addAccount: (account) => {
    const newAccount = {
      account_id: account.account_id || `account_${get().idCounter + 1}`,
      ...account,
      is_tscircuit_staff: Boolean(account.is_tscircuit_staff),
      created_at: /* @__PURE__ */ new Date(),
      personal_org_id: account.personal_org_id || `porg_${get().idCounter + 1}`
    };
    set((state) => {
      return {
        accounts: [...state.accounts, newAccount],
        idCounter: state.idCounter + 1
      };
    });
    return newAccount;
  },
  addAccountPackage: (accountPackage) => {
    const newAccountPackage = {
      account_package_id: `ap_${get().idCounter + 1}`,
      ...accountPackage
    };
    set((state) => {
      return {
        accountPackages: [...state.accountPackages, newAccountPackage],
        idCounter: state.idCounter + 1
      };
    });
    return newAccountPackage;
  },
  getAccountPackageById: (accountPackageId) => {
    const state = get();
    return state.accountPackages.find(
      (ap) => ap.account_package_id === accountPackageId
    );
  },
  updateAccountPackage: (accountPackageId, updates) => {
    set((state) => ({
      accountPackages: state.accountPackages.map(
        (ap) => ap.account_package_id === accountPackageId ? { ...ap, ...updates } : ap
      )
    }));
  },
  deleteAccountPackage: (accountPackageId) => {
    let deleted = false;
    set((state) => {
      const index = state.accountPackages.findIndex(
        (ap) => ap.account_package_id === accountPackageId
      );
      if (index !== -1) {
        state.accountPackages.splice(index, 1);
        deleted = true;
      }
      return state;
    });
    return deleted;
  },
  addSnippet: (snippet) => {
    const timestamp = Date.now();
    const currentTime = new Date(timestamp).toISOString();
    const newState = get();
    const nextId = newState.idCounter + 1;
    const newPackage = {
      package_id: `pkg_${nextId}`,
      creator_account_id: snippet.creator_account_id ?? snippet.owner_name,
      // Using owner_name as account_id since we don't have context
      owner_org_id: "",
      // Empty string instead of null to match type
      owner_github_username: snippet.owner_name,
      is_source_from_github: false,
      description: snippet.description || "",
      name: `${snippet.owner_name}/${snippet.unscoped_name}`,
      unscoped_name: snippet.unscoped_name,
      latest_version: "0.0.1",
      license: null,
      website: null,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      github_repo_full_name: snippet.github_repo_full_name || null,
      ai_description: "placeholder ai description",
      ai_usage_instructions: "placeholder ai usage instructions",
      is_snippet: true,
      is_board: snippet.snippet_type === "board",
      is_package: snippet.snippet_type === "package",
      is_model: snippet.snippet_type === "model",
      is_footprint: snippet.snippet_type === "footprint",
      snippet_type: snippet.snippet_type,
      is_private: false,
      is_public: true,
      is_unlisted: false,
      latest_package_release_id: `package_release_${nextId}`,
      latest_package_release_fs_sha: null,
      public_dist_enabled: false
    };
    const newPackageRelease = packageReleaseSchema.parse({
      package_release_id: `package_release_${nextId}`,
      package_id: newPackage.package_id,
      version: "0.0.1",
      is_latest: true,
      is_locked: false,
      created_at: currentTime,
      updated_at: currentTime,
      branch_name: snippet.branch_name,
      commit_message: snippet.commit_message,
      commit_author: snippet.commit_author,
      has_transpiled: true,
      transpilation_error: null,
      ...snippet.name == "testuser/my-test-board" ? { is_pr_preview: true, github_pr_number: 69 } : {}
    });
    const packageFiles = [];
    let fileIdCounter = nextId;
    packageFiles.push({
      package_file_id: `package_file_${fileIdCounter++}`,
      package_release_id: newPackageRelease.package_release_id,
      file_path: "index.tsx",
      content_text: snippet.code || "",
      created_at: currentTime
    });
    if (snippet.dts) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.d.ts",
        content_text: snippet.dts,
        created_at: currentTime
      });
    }
    if (snippet.compiled_js) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/index.js",
        content_text: snippet.compiled_js,
        created_at: currentTime
      });
    }
    if (snippet.circuit_json && snippet.circuit_json.length > 0) {
      packageFiles.push({
        package_file_id: `package_file_${fileIdCounter++}`,
        package_release_id: newPackageRelease.package_release_id,
        file_path: "/dist/circuit.json",
        content_text: JSON.stringify(snippet.circuit_json),
        created_at: currentTime
      });
    }
    set((state) => ({
      ...state,
      packages: [...state.packages, newPackage],
      packageReleases: [...state.packageReleases, newPackageRelease],
      packageFiles: [...state.packageFiles, ...packageFiles],
      idCounter: fileIdCounter
    }));
    const dbState = get();
    const releaseFiles = dbState.packageFiles.filter(
      (pf) => pf.package_release_id === newPackageRelease.package_release_id
    );
    const fsSha = generateFsSha(releaseFiles);
    set((state) => ({
      ...state,
      packageReleases: state.packageReleases.map(
        (pr) => pr.package_release_id === newPackageRelease.package_release_id ? { ...pr, fs_sha: fsSha } : pr
      ),
      packages: state.packages.map(
        (pkg) => pkg.latest_package_release_id === newPackageRelease.package_release_id ? { ...pkg, latest_package_release_fs_sha: fsSha } : pkg
      )
    }));
    return {
      snippet_id: newPackage.package_id,
      package_release_id: newPackageRelease.package_release_id,
      name: newPackage.name,
      unscoped_name: newPackage.unscoped_name,
      owner_name: snippet.owner_name,
      code: snippet.code || "",
      dts: snippet.dts,
      compiled_js: snippet.compiled_js,
      star_count: 0,
      created_at: currentTime,
      updated_at: currentTime,
      snippet_type: snippet.snippet_type,
      circuit_json: snippet.circuit_json || [],
      description: snippet.description || "",
      is_starred: false,
      version: "0.0.1",
      is_private: false,
      is_public: true,
      is_unlisted: false
    };
  },
  getLatestSnippets: (limit) => {
    const state = get();
    const snippetPackages = state.packages.filter((pkg) => pkg.is_snippet === true).map((pkg) => {
      const packageRelease = state.packageReleases.find(
        (pr) => pr.package_release_id === pkg.latest_package_release_id && pr.is_latest === true
      );
      if (!packageRelease) return null;
      const packageFiles = state.packageFiles.filter(
        (file) => file.package_release_id === packageRelease.package_release_id
      );
      const codeFile = packageFiles.find(
        (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
      );
      const isStarred = state.accountPackages.some(
        (ap) => ap.package_id === pkg.package_id && ap.is_starred
      );
      return {
        snippet_id: pkg.package_id,
        package_release_id: pkg.latest_package_release_id || "",
        unscoped_name: pkg.unscoped_name,
        name: pkg.name,
        owner_name: pkg.owner_github_username || "",
        description: pkg.description || "",
        snippet_type: pkg.snippet_type || "board",
        code: codeFile?.content_text || "",
        dts: packageFiles.find((file) => file.file_path === "/dist/index.d.ts")?.content_text || "",
        compiled_js: packageFiles.find((file) => file.file_path === "/dist/index.js")?.content_text || "",
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        star_count: pkg.star_count || 0,
        is_starred: isStarred,
        version: pkg.latest_version || "0.0.1",
        circuit_json: packageFiles.filter((file) => file.file_path === "/dist/circuit.json").flatMap((file) => JSON.parse(file.content_text || "[]")) || [],
        is_private: pkg.is_private || false,
        is_public: pkg.is_public || true,
        is_unlisted: pkg.is_unlisted || false
      };
    }).filter(
      (snippet) => snippet !== null
    ).map((snippet) => ({
      ...snippet,
      description: snippet.description || ""
    })).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, limit);
    return snippetPackages;
  },
  getTrendingSnippets: (limit, since) => {
    const state = get();
    const sinceDate = new Date(since).getTime();
    const recentStars = /* @__PURE__ */ new Map();
    state.accountPackages.forEach((ap) => {
      if (ap.is_starred && new Date(ap.created_at).getTime() >= sinceDate) {
        recentStars.set(
          ap.package_id,
          (recentStars.get(ap.package_id) || 0) + 1
        );
      }
    });
    const packagesWithStarCount = [...state.packages].map((pkg) => ({
      ...pkg,
      star_count: recentStars.get(pkg.package_id) || 0
    })).sort((a, b) => b.star_count - a.star_count).slice(0, limit);
    const trendingSnippets = packagesWithStarCount.map((pkg) => {
      const packageRelease = state.packageReleases.find(
        (pr) => pr.package_release_id === pkg.latest_package_release_id && pr.is_latest === true
      );
      if (!packageRelease) return null;
      const packageFiles = state.packageFiles.filter(
        (file) => file.package_release_id === packageRelease.package_release_id
      );
      const codeFile = packageFiles.find(
        (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
      );
      return {
        snippet_id: pkg.package_id,
        package_release_id: pkg.latest_package_release_id || "",
        unscoped_name: pkg.unscoped_name,
        name: pkg.name,
        owner_name: pkg.owner_github_username || "",
        code: codeFile ? codeFile.content_text || "" : "",
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        snippet_type: pkg.is_snippet ? "board" : "package",
        star_count: pkg.star_count
      };
    }).filter((snippet) => snippet !== null);
    return trendingSnippets;
  },
  getPackagesByAuthor: (authorName) => {
    const state = get();
    const packages = authorName ? state.packages.filter((pkg) => pkg.owner_github_username === authorName) : state.packages;
    return packages.map((pkg) => ({
      ...pkg,
      star_count: state.accountPackages.filter(
        (ap) => ap.package_id === pkg.package_id && ap.is_starred
      ).length
    }));
  },
  getSnippetByAuthorAndName: (authorName, snippetName) => {
    const state = get();
    const _package = state.packages.find(
      (pkg) => pkg.owner_github_username?.toLowerCase() === authorName.toLowerCase() && pkg.name.toLowerCase() === snippetName.toLowerCase() && pkg.is_snippet === true
    );
    if (!_package) return void 0;
    const packageRelease = state.packageReleases.find(
      (pr) => pr.package_release_id === _package.latest_package_release_id && pr.is_latest === true
    );
    if (!packageRelease) return void 0;
    const packageFiles = state.packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id
    );
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
    );
    return {
      snippet_id: _package.package_id,
      package_release_id: _package.latest_package_release_id || "",
      unscoped_name: _package.unscoped_name,
      name: _package.name,
      owner_name: _package.owner_github_username || "",
      description: _package.description || "",
      snippet_type: _package.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts: packageFiles.find((file) => file.file_path === "/dist/index.d.ts")?.content_text || "",
      compiled_js: packageFiles.find((file) => file.file_path === "/dist/index.js")?.content_text || "",
      created_at: _package.created_at,
      updated_at: _package.updated_at,
      star_count: _package.star_count || 0,
      is_starred: false,
      version: _package.latest_version || "0.0.1",
      circuit_json: packageFiles.find(
        (file) => file.file_path === "/dist/circuit.json"
      )?.content_text ? JSON.parse(
        packageFiles.find((file) => file.file_path === "/dist/circuit.json")?.content_text || "[]"
      ) : [],
      is_private: _package.is_private || false,
      is_public: _package.is_public || true,
      is_unlisted: _package.is_unlisted || false
    };
  },
  updateSnippet: (snippetId, updates) => {
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === snippetId && pkg.is_snippet === true
      );
      if (packageIndex === -1) {
        return state;
      }
      const timestamp = Date.now();
      const currentTime = new Date(timestamp).toISOString();
      const updatedPackages = [...state.packages];
      const currentPackage = updatedPackages[packageIndex];
      updatedPackages[packageIndex] = {
        ...currentPackage,
        description: updates.description ?? currentPackage.description,
        is_private: updates.is_private ?? currentPackage.is_private,
        is_public: updates.is_private !== void 0 ? !updates.is_private : currentPackage.is_public,
        is_unlisted: updates.is_private ? true : updates.is_unlisted ?? currentPackage.is_unlisted,
        updated_at: currentTime
      };
      const packageRelease2 = state.packageReleases.find(
        (pr) => pr.package_release_id === currentPackage.latest_package_release_id
      );
      if (!packageRelease2) return state;
      const updatedFiles = [...state.packageFiles];
      const packageFiles2 = updatedFiles.filter(
        (file) => file.package_release_id === packageRelease2.package_release_id
      );
      if (updates.code !== void 0) {
        const codeFileIndex = packageFiles2.findIndex(
          (file) => file.file_path === "index.tsx" || file.file_path === "index.ts"
        );
        if (codeFileIndex >= 0) {
          updatedFiles[codeFileIndex] = {
            ...packageFiles2[codeFileIndex],
            content_text: updates.code,
            created_at: currentTime
          };
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease2.package_release_id,
            file_path: "index.tsx",
            content_text: updates.code,
            created_at: currentTime
          });
        }
      }
      if (updates.dts !== void 0) {
        const dtsFileIndex = packageFiles2.findIndex(
          (file) => file.file_path === "/dist/index.d.ts"
        );
        if (dtsFileIndex >= 0) {
          updatedFiles[dtsFileIndex] = {
            ...packageFiles2[dtsFileIndex],
            content_text: updates.dts,
            created_at: currentTime
          };
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease2.package_release_id,
            file_path: "/dist/index.d.ts",
            content_text: updates.dts,
            created_at: currentTime
          });
        }
      }
      if (updates.compiled_js !== void 0) {
        const jsFileIndex = packageFiles2.findIndex(
          (file) => file.file_path === "/dist/index.js"
        );
        if (jsFileIndex >= 0) {
          updatedFiles[jsFileIndex] = {
            ...packageFiles2[jsFileIndex],
            content_text: updates.compiled_js,
            created_at: currentTime
          };
        } else {
          updatedFiles.push({
            package_file_id: `package_file_${timestamp}`,
            package_release_id: packageRelease2.package_release_id,
            file_path: "/dist/index.js",
            content_text: updates.compiled_js,
            created_at: currentTime
          });
        }
      }
      if (updates.circuit_json !== void 0) {
        const circuitFileIndex = packageFiles2.findIndex(
          (file) => file.file_path === "/dist/circuit.json"
        );
        if (circuitFileIndex >= 0) {
          updatedFiles[circuitFileIndex] = {
            ...packageFiles2[circuitFileIndex],
            content_text: JSON.stringify(updates.circuit_json),
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
        }
      }
      return {
        ...state,
        packages: updatedPackages,
        packageFiles: updatedFiles
      };
    });
    const updatedPackage = get().packages.find(
      (pkg) => pkg.package_id === snippetId
    );
    if (!updatedPackage) return void 0;
    const packageRelease = get().packageReleases.find(
      (pr) => pr.package_release_id === updatedPackage.latest_package_release_id
    );
    if (!packageRelease) return void 0;
    const packageFiles = get().packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id
    );
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
    );
    const dtsFile = packageFiles.find(
      (file) => file.file_path === "/dist/index.d.ts"
    );
    const jsFile = packageFiles.find(
      (file) => file.file_path === "/dist/index.js"
    );
    const circuitFile = packageFiles.find(
      (file) => file.file_path === "/dist/circuit.json"
    );
    return {
      snippet_id: updatedPackage.package_id,
      package_release_id: updatedPackage.latest_package_release_id || "",
      unscoped_name: updatedPackage.unscoped_name,
      name: updatedPackage.name,
      owner_name: updatedPackage.owner_github_username || "",
      description: updatedPackage.description || "",
      snippet_type: updatedPackage.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts: dtsFile?.content_text || "",
      compiled_js: jsFile?.content_text || "",
      created_at: updatedPackage.created_at,
      updated_at: updatedPackage.updated_at,
      star_count: updatedPackage.star_count || 0,
      is_starred: false,
      version: updatedPackage.latest_version || "0.0.1",
      circuit_json: circuitFile ? JSON.parse(circuitFile.content_text || "[]") : [],
      is_private: updatedPackage.is_private ?? false,
      is_public: updatedPackage.is_public ?? true,
      is_unlisted: updatedPackage.is_unlisted ?? false
    };
  },
  getSnippetById: (snippetId, auth) => {
    const state = get();
    const _package = state.packages.find(
      (pkg) => pkg.package_id === snippetId && pkg.is_snippet === true
    );
    if (!_package) return void 0;
    if (!auth) {
      if (!_package.is_public || _package.is_unlisted) {
        return void 0;
      }
    } else {
      const isOwnPackage = _package.owner_github_username === auth?.github_username;
      const isPublicAndNotUnlisted = _package.is_public && !_package.is_unlisted;
      const isOwnUnlisted = _package.is_unlisted && isOwnPackage;
      const isOwnPrivate = _package.is_private && isOwnPackage;
      if (!isPublicAndNotUnlisted && !isOwnUnlisted && !isOwnPrivate) {
        return void 0;
      }
    }
    const packageRelease = state.packageReleases.find(
      (pr) => pr.package_release_id === _package.latest_package_release_id && pr.is_latest === true
    );
    if (!packageRelease) return void 0;
    const packageFiles = state.packageFiles.filter(
      (file) => file.package_release_id === packageRelease.package_release_id
    );
    const codeFile = packageFiles.find(
      (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
    );
    const isStarred = state.accountPackages.some(
      (ap) => ap.package_id === snippetId && ap.is_starred
    );
    return {
      snippet_id: _package.package_id,
      package_release_id: _package.latest_package_release_id || "",
      unscoped_name: _package.unscoped_name,
      name: _package.name,
      owner_name: _package.owner_github_username || "",
      description: _package.description || "",
      snippet_type: _package.snippet_type || "board",
      code: codeFile?.content_text || "",
      dts: packageFiles.find((file) => file.file_path === "/dist/index.d.ts")?.content_text || "",
      compiled_js: packageFiles.find((file) => file.file_path === "/dist/index.js")?.content_text || "",
      created_at: _package.created_at,
      updated_at: _package.updated_at,
      star_count: _package.star_count || 0,
      is_starred: isStarred,
      version: _package.latest_version || "0.0.1",
      circuit_json: packageFiles.find(
        (file) => file.file_path === "/dist/circuit.json"
      )?.content_text ? JSON.parse(
        packageFiles.find((file) => file.file_path === "/dist/circuit.json")?.content_text || "[]"
      ) : [],
      is_private: _package.is_private || false,
      is_public: _package.is_public || true,
      is_unlisted: _package.is_unlisted || false
    };
  },
  searchSnippets: (query) => {
    const state = get();
    const lowercaseQuery = query.toLowerCase();
    const packages = state.packages.filter((pkg) => pkg.is_snippet === true);
    const matchingPackagesByMetadata = packages.filter(
      (pkg) => pkg.name.toLowerCase().includes(lowercaseQuery) || pkg.description?.toLowerCase().includes(lowercaseQuery)
    );
    const matchingFilesByContent = state.packageFiles.filter(
      (file) => file.content_text?.toLowerCase().includes(lowercaseQuery) ?? false
    );
    const matchingPackagesByContent = matchingFilesByContent.map((file) => {
      const packageRelease = state.packageReleases.find(
        (pr) => pr.package_release_id === file.package_release_id
      );
      if (!packageRelease) return null;
      return packages.find(
        (pkg) => pkg.latest_package_release_id === packageRelease.package_release_id
      );
    }).filter((pkg) => pkg !== null);
    const matchingPackages = [
      .../* @__PURE__ */ new Set([...matchingPackagesByMetadata, ...matchingPackagesByContent])
    ];
    return matchingPackages.map((pkg) => {
      const packageRelease = state.packageReleases.find(
        (pr) => pr.package_release_id === pkg.latest_package_release_id && pr.is_latest === true
      );
      if (!packageRelease) return null;
      const packageFiles = state.packageFiles.filter(
        (file) => file.package_release_id === packageRelease.package_release_id
      );
      const codeFile = packageFiles.find(
        (file) => file.file_path === "index.ts" || file.file_path === "index.tsx"
      );
      const isStarred = state.accountPackages.some(
        (ap) => ap.package_id === pkg.package_id && ap.is_starred
      );
      return {
        snippet_id: pkg.package_id,
        package_release_id: pkg.latest_package_release_id || "",
        unscoped_name: pkg.unscoped_name,
        name: pkg.name,
        owner_name: pkg.owner_github_username || "",
        description: pkg.description || "",
        snippet_type: pkg.snippet_type || "board",
        code: codeFile?.content_text || "",
        dts: packageFiles.find((file) => file.file_path === "/dist/index.d.ts")?.content_text || "",
        compiled_js: packageFiles.find((file) => file.file_path === "/dist/index.js")?.content_text || "",
        created_at: pkg.created_at,
        updated_at: pkg.updated_at,
        star_count: pkg.star_count || 0,
        is_starred: isStarred,
        version: pkg.latest_version || "0.0.1",
        circuit_json: packageFiles.filter((file) => file.file_path === "/dist/circuit.json").flatMap((file) => JSON.parse(file.content_text || "[]")) || []
      };
    }).filter((snippet) => snippet !== null);
  },
  searchPackages: (query, account_id) => {
    const state = get();
    const lowercaseQuery = query.toLowerCase();
    const userOrgIds = account_id ? new Set(
      state.orgAccounts.filter((oa) => oa.account_id === account_id).map((oa) => oa.org_id)
    ) : /* @__PURE__ */ new Set();
    const packages = state.packages.filter(
      (pkg) => pkg.is_public === true || account_id && pkg.owner_org_id && userOrgIds.has(pkg.owner_org_id)
    );
    const matchingPackagesByMetadata = packages.filter(
      (pkg) => pkg.name.toLowerCase().includes(lowercaseQuery) || pkg.description?.toLowerCase().includes(lowercaseQuery)
    );
    const matchingFilesByContent = state.packageFiles.filter(
      (file) => file.content_text?.toLowerCase().includes(lowercaseQuery) ?? false
    );
    const matchingPackagesByContent = matchingFilesByContent.map((file) => {
      const packageRelease = state.packageReleases.find(
        (pr) => pr.package_release_id === file.package_release_id
      );
      if (!packageRelease) return void 0;
      return packages.find(
        (pkg) => pkg.latest_package_release_id === packageRelease.package_release_id
      );
    }).filter((pkg) => pkg != null);
    const matchingPackages = [
      .../* @__PURE__ */ new Set([...matchingPackagesByMetadata, ...matchingPackagesByContent])
    ];
    return matchingPackages;
  },
  searchAccounts: (query, limit) => {
    const state = get();
    const lowercaseQuery = query.toLowerCase();
    const accountsWithPublicPackages = /* @__PURE__ */ new Set();
    state.packages.filter((pkg) => pkg.is_public === true).forEach((pkg) => {
      if (pkg.creator_account_id) {
        accountsWithPublicPackages.add(pkg.creator_account_id);
      }
      if (pkg.owner_github_username) {
        const account = state.accounts.find(
          (acc) => acc.github_username === pkg.owner_github_username
        );
        if (account) {
          accountsWithPublicPackages.add(account.account_id);
        }
      }
    });
    const matchingAccounts = state.accounts.filter((account) => {
      if (!accountsWithPublicPackages.has(account.account_id)) {
        return false;
      }
      return account.github_username.toLowerCase().includes(lowercaseQuery) || (account.tscircuit_handle?.toLowerCase().includes(lowercaseQuery) ?? false);
    }).slice(0, limit || 50);
    return matchingAccounts;
  },
  searchOrgs: (query, limit) => {
    const state = get();
    const lowercaseQuery = query.toLowerCase();
    const matchingOrgs = state.organizations.filter((org) => {
      return org.tscircuit_handle?.toLowerCase().includes(lowercaseQuery);
    }).slice(0, limit || 50);
    return matchingOrgs.map((org) => {
      const member_count = state.accounts.filter(
        (account) => account.personal_org_id === org.org_id
      ).length;
      const package_count = state.packages.filter(
        (pkg) => pkg.owner_org_id === org.org_id
      ).length;
      return {
        ...org,
        member_count,
        package_count
      };
    });
  },
  deleteSnippet: (snippetId) => {
    let deleted = false;
    set((state) => {
      const index = state.snippets.findIndex((s) => s.snippet_id === snippetId);
      if (index !== -1) {
        state.snippets.splice(index, 1);
        deleted = true;
      }
      return state;
    });
    return deleted;
  },
  addSession: (session) => {
    const newSession = { session_id: `session_${Date.now()}`, ...session };
    set((state) => ({
      sessions: [...state.sessions, newSession]
    }));
    return newSession;
  },
  getSessions: ({
    account_id,
    is_cli_session
  }) => {
    const state = get();
    return state.sessions.filter(
      (session) => session.account_id === account_id && (is_cli_session === void 0 || session.is_cli_session === is_cli_session)
    );
  },
  createLoginPage: () => {
    const newLoginPage = {
      login_page_id: `login_page_${Date.now()}`,
      login_page_auth_token: `token_${Date.now()}`,
      was_login_successful: false,
      has_been_used_to_create_session: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1e3).toISOString()
      // 30 minutes expiration
    };
    set((state) => ({
      loginPages: [...state.loginPages, newLoginPage]
    }));
    return newLoginPage;
  },
  getLoginPage: (loginPageId) => {
    const state = get();
    return state.loginPages.find((lp) => lp.login_page_id === loginPageId);
  },
  updateLoginPage: (loginPageId, updates) => {
    set((state) => ({
      loginPages: state.loginPages.map(
        (lp) => lp.login_page_id === loginPageId ? { ...lp, ...updates } : lp
      )
    }));
  },
  getAccount: (accountId) => {
    const state = get();
    return state.accounts.find((account) => account.account_id === accountId);
  },
  updateAccount: (accountId, updates) => {
    let updatedAccount;
    set((state) => {
      const accountIndex = state.accounts.findIndex(
        (account) => account.account_id === accountId
      );
      if (accountIndex !== -1) {
        updatedAccount = { ...state.accounts[accountIndex] };
        if (updates.tscircuit_handle) {
          updatedAccount.tscircuit_handle = updates.tscircuit_handle;
          delete updates.tscircuit_handle;
        }
        if (updates.shippingInfo) {
          updatedAccount.shippingInfo = {
            ...updatedAccount.shippingInfo,
            ...updates.shippingInfo
          };
          delete updates.shippingInfo;
        }
        updatedAccount = { ...updatedAccount, ...updates };
        const updatedAccounts = [...state.accounts];
        updatedAccounts[accountIndex] = updatedAccount;
        return { ...state, accounts: updatedAccounts };
      }
      return state;
    });
    return updatedAccount;
  },
  createSession: (session) => {
    const newSession = { session_id: `session_${Date.now()}`, ...session };
    set((state) => ({
      sessions: [...state.sessions, newSession]
    }));
    return newSession;
  },
  deleteSession: (sessionId) => {
    let deleted = false;
    set((state) => {
      const index = state.sessions.findIndex(
        (session) => session.session_id === sessionId
      );
      if (index !== -1) {
        state.sessions.splice(index, 1);
        deleted = true;
      }
      return state;
    });
    return deleted;
  },
  addStar: (accountId, packageId) => {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const accountPackage = {
      account_package_id: `ap_${Date.now()}`,
      account_id: accountId,
      package_id: packageId,
      is_starred: true,
      created_at: now,
      updated_at: now
    };
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId
      );
      if (packageIndex >= 0) {
        const updatedPackages = [...state.packages];
        updatedPackages[packageIndex] = {
          ...updatedPackages[packageIndex],
          star_count: (updatedPackages[packageIndex].star_count || 0) + 1
        };
        return {
          packages: updatedPackages,
          accountPackages: [...state.accountPackages, accountPackage]
        };
      }
      return {
        accountPackages: [...state.accountPackages, accountPackage]
      };
    });
    return accountPackage;
  },
  removeStar: (accountId, packageId) => {
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId
      );
      if (packageIndex >= 0) {
        const updatedPackages = [...state.packages];
        updatedPackages[packageIndex] = {
          ...updatedPackages[packageIndex],
          star_count: Math.max(
            0,
            (updatedPackages[packageIndex].star_count || 0) - 1
          )
        };
        return {
          packages: updatedPackages,
          accountPackages: state.accountPackages.filter(
            (ap) => !(ap.account_id === accountId && ap.package_id === packageId)
          )
        };
      }
      return {
        accountPackages: state.accountPackages.filter(
          (ap) => !(ap.account_id === accountId && ap.package_id === packageId)
        )
      };
    });
  },
  hasStarred: (accountId, packageId) => {
    const state = get();
    return state.accountPackages.some(
      (ap) => ap.account_id === accountId && ap.package_id === packageId && ap.is_starred
    );
  },
  addPackage: (_package) => {
    const state = get();
    const nextId = state.idCounter + 1;
    const newPackage = {
      package_id: `package_${nextId}`,
      github_repo_full_name: null,
      latest_pcb_preview_image_url: _package.latest_pcb_preview_image_url ?? `/api/packages/images/${_package.name}`,
      latest_cad_preview_image_url: _package.latest_cad_preview_image_url ?? `/api/packages/images/${_package.name}`,
      latest_sch_preview_image_url: _package.latest_sch_preview_image_url ?? `/api/packages/images/${_package.name}`,
      ..._package
    };
    set((state2) => ({
      idCounter: state2.idCounter + 1,
      packages: [...state2.packages, newPackage]
    }));
    return newPackage;
  },
  updatePackage: (packageId, updates) => {
    let updatedPackage;
    set((state) => {
      const packageIndex = state.packages.findIndex(
        (pkg) => pkg.package_id === packageId
      );
      if (packageIndex === -1) return state;
      const updatedPackages = [...state.packages];
      updatedPackages[packageIndex] = {
        ...updatedPackages[packageIndex],
        ...updates
      };
      updatedPackage = updatedPackages[packageIndex];
      return { ...state, packages: updatedPackages };
    });
    return updatedPackage;
  },
  getPackageById: (packageId) => {
    const state = get();
    const pkg = state.packages.find((pkg2) => pkg2.package_id === packageId);
    if (!pkg) return void 0;
    return {
      ...pkg
    };
  },
  getPackageReleaseById: (packageReleaseId) => {
    const state = get();
    return state.packageReleases.find(
      (pr) => pr.package_release_id === packageReleaseId
    );
  },
  addPackageRelease: (packageRelease) => {
    const state = get();
    const nextId = state.idCounter + 1;
    const parsed = packageReleaseSchema.parse({
      package_release_id: `package_release_${nextId}`,
      ...packageRelease
    });
    set((state2) => ({
      idCounter: state2.idCounter + 1,
      packageReleases: [...state2.packageReleases, parsed]
    }));
    return parsed;
  },
  updatePackageRelease: (packageRelease) => {
    set((state) => ({
      packageReleases: state.packageReleases.map(
        (pr) => pr.package_release_id === packageRelease.package_release_id ? packageRelease : pr
      )
    }));
  },
  deletePackageFile: (packageFileId) => {
    let deleted = false;
    set((state) => {
      const index = state.packageFiles.findIndex(
        (file) => file.package_file_id === packageFileId
      );
      if (index !== -1) {
        state.packageFiles.splice(index, 1);
        deleted = true;
      }
      return state;
    });
    return deleted;
  },
  addPackageFile: (packageFile) => {
    const newPackageFile = {
      package_file_id: `package_file_${get().idCounter + 1}`,
      ...packageFile
    };
    set((state) => ({
      idCounter: state.idCounter + 1,
      packageFiles: [...state.packageFiles, newPackageFile]
    }));
    return newPackageFile;
  },
  updatePackageFile: (packageFileId, updates) => {
    set((state2) => ({
      packageFiles: state2.packageFiles.map(
        (file) => file.package_file_id === packageFileId ? { ...file, ...updates } : file
      )
    }));
    const state = get();
    return state.packageFiles.find(
      (file) => file.package_file_id === packageFileId
    );
  },
  getStarCount: (packageId) => {
    const state = get();
    return state.accountPackages.filter(
      (ap) => ap.package_id === packageId && ap.is_starred
    ).length;
  },
  getPackageFilesByReleaseId: (packageReleaseId) => {
    const state = get();
    return state.packageFiles.filter(
      (pf) => pf.package_release_id === packageReleaseId
    );
  },
  /**
   * Update fs_sha for a package release based on its files
   */
  updatePackageReleaseFsSha: (packageReleaseId) => {
    const state = get();
    const packageFiles = state.packageFiles.filter(
      (pf) => pf.package_release_id === packageReleaseId
    );
    const fsSha = generateFsSha(packageFiles);
    set((currentState) => ({
      ...currentState,
      packageReleases: currentState.packageReleases.map(
        (pr) => pr.package_release_id === packageReleaseId ? { ...pr, fs_sha: fsSha } : pr
      ),
      packages: currentState.packages.map(
        (pkg) => pkg.latest_package_release_id === packageReleaseId ? { ...pkg, latest_package_release_fs_sha: fsSha } : pkg
      )
    }));
  },
  addAiReview: (review) => {
    const base = aiReviewSchema.omit({ ai_review_id: true }).parse(review);
    const newReview = {
      ai_review_id: crypto.randomUUID(),
      ...base
    };
    set((state) => ({
      aiReviews: [...state.aiReviews, newReview],
      idCounter: state.idCounter + 1
    }));
    return newReview;
  },
  updateAiReview: (aiReviewId, updates) => {
    let updated;
    set((state) => {
      const index = state.aiReviews.findIndex(
        (ar) => ar.ai_review_id === aiReviewId
      );
      if (index === -1) return state;
      const aiReviews = [...state.aiReviews];
      aiReviews[index] = { ...aiReviews[index], ...updates };
      updated = aiReviews[index];
      return { ...state, aiReviews };
    });
    return updated;
  },
  getAiReviewById: (aiReviewId) => {
    const state = get();
    return state.aiReviews.find((ar) => ar.ai_review_id === aiReviewId);
  },
  listAiReviews: () => {
    const state = get();
    return state.aiReviews;
  },
  addDatasheet: ({ chip_name }) => {
    const newDatasheet = datasheetSchema.parse({
      datasheet_id: crypto.randomUUID(),
      chip_name,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      pin_information: null,
      datasheet_pdf_urls: null,
      ai_description: null
    });
    set((state) => ({
      datasheets: [...state.datasheets, newDatasheet]
    }));
    return newDatasheet;
  },
  getDatasheetById: (datasheetId) => {
    const state = get();
    return state.datasheets.find((d) => d.datasheet_id === datasheetId);
  },
  getDatasheetByChipName: (chipName) => {
    const state = get();
    return state.datasheets.find(
      (d) => d.chip_name.toLowerCase() === chipName.toLowerCase()
    );
  },
  listDatasheets: ({
    chip_name,
    is_popular
  } = {}) => {
    const state = get();
    if (is_popular) {
      return state.datasheets;
    }
    if (chip_name) {
      return state.datasheets.filter(
        (d) => d.chip_name.toLowerCase().includes(chip_name.toLowerCase())
      );
    }
    return state.datasheets;
  },
  updateDatasheet: (datasheetId, updates) => {
    let updated;
    set((state) => {
      const index = state.datasheets.findIndex(
        (d) => d.datasheet_id === datasheetId
      );
      if (index === -1) return state;
      const datasheets = [...state.datasheets];
      datasheets[index] = { ...datasheets[index], ...updates };
      updated = datasheets[index];
      return { ...state, datasheets };
    });
    return updated;
  },
  addPackageBuild: (packageBuild) => {
    const newPackageBuild = packageBuildSchema.parse({
      package_build_id: crypto.randomUUID(),
      user_code_job_completed_logs: null,
      image_generation_logs: null,
      ...packageBuild
    });
    set((state) => ({
      packageBuilds: [...state.packageBuilds, newPackageBuild],
      // Automatically update the package release to reference this as the latest build
      packageReleases: state.packageReleases.map(
        (release) => release.package_release_id === packageBuild.package_release_id ? {
          ...release,
          latest_package_build_id: newPackageBuild.package_build_id
        } : release
      )
    }));
    return newPackageBuild;
  },
  getPackageBuildById: (packageBuildId) => {
    const state = get();
    return state.packageBuilds.find(
      (pb) => pb.package_build_id === packageBuildId
    );
  },
  getPackageBuildsByReleaseId: (packageReleaseId) => {
    const state = get();
    return state.packageBuilds.filter((pb) => pb.package_release_id === packageReleaseId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  updatePackageBuild: (packageBuildId, updates) => {
    let updated;
    set((state) => {
      const index = state.packageBuilds.findIndex(
        (pb) => pb.package_build_id === packageBuildId
      );
      if (index === -1) return state;
      const packageBuilds = [...state.packageBuilds];
      packageBuilds[index] = { ...packageBuilds[index], ...updates };
      updated = packageBuilds[index];
      return { ...state, packageBuilds };
    });
    return updated;
  },
  addOrganization: (organization) => {
    const newOrganization = {
      org_id: organization.org_id || `org_${get().idCounter + 1}`,
      github_handle: organization.github_handle ?? null,
      is_personal_org: organization.is_personal_org || false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      org_display_name: organization.org_display_name ?? organization.tscircuit_handle ?? void 0,
      avatar_url: organization.avatar_url ?? null,
      tscircuit_handle: organization.tscircuit_handle || organization.name || null,
      ...organization
    };
    set((state) => ({
      idCounter: state.idCounter + 1,
      organizations: [...state.organizations, newOrganization],
      // Add the creator as a member of the new org by setting their personal_org_id
      accounts: state.accounts.map(
        (account) => account.account_id === organization.owner_account_id ? { ...account, personal_org_id: newOrganization.org_id } : account
      )
    }));
    return newOrganization;
  },
  getOrgs: (filters, auth) => {
    let orgs = get().organizations;
    if (filters?.owner_account_id) {
      orgs = orgs.filter(
        (org) => org.owner_account_id === filters.owner_account_id
      );
    }
    if (filters?.account_id) {
      orgs = orgs.filter((org) => {
        const isMemberViaOrgAccounts = get().orgAccounts.some(
          (oa) => oa.org_id === org.org_id && oa.account_id === filters.account_id
        );
        const isPersonalOrg = org.is_personal_org && org.owner_account_id === filters.account_id;
        return isMemberViaOrgAccounts || isPersonalOrg;
      });
    }
    if (filters?.github_handle) {
      orgs = orgs.filter((org) => {
        const account = get().accounts.find(
          (account2) => account2.account_id === org.owner_account_id
        );
        return account?.github_username === filters.github_handle;
      });
    }
    if (filters?.tscircuit_handle) {
      const account = get().accounts.find(
        (account2) => account2.tscircuit_handle === filters.tscircuit_handle
      );
      orgs = orgs.filter((org) => {
        const orgAccount = get().orgAccounts.find(
          (oa) => oa.org_id === org.org_id && oa.account_id === account?.account_id
        );
        const isPersonalOrg = org.is_personal_org && org.owner_account_id === account?.account_id;
        return Boolean(orgAccount) || isPersonalOrg;
      });
    }
    if (filters?.name) {
      orgs = orgs.filter(
        (org) => org.github_handle === filters.name || org.tscircuit_handle === filters.name
      );
    }
    return orgs.map((org) => {
      const member_count = get().accounts.filter(
        (account) => account.personal_org_id === org.org_id
      ).length;
      const package_count = get().packages.filter(
        (pkg) => pkg.owner_org_id === org.org_id
      ).length;
      const can_manage_org = auth ? org.owner_account_id === auth.account_id : false;
      return {
        ...org,
        member_count,
        package_count,
        can_manage_org
      };
    });
  },
  getOrg: (filters, auth) => {
    let orgs = get().organizations;
    if (filters?.org_id) {
      orgs = orgs.filter((org2) => org2.org_id === filters.org_id);
    }
    if (filters?.github_handle) {
      orgs = orgs.filter((org2) => org2.github_handle === filters.github_handle);
    }
    if (filters?.tscircuit_handle) {
      orgs = orgs.filter(
        (org2) => org2.tscircuit_handle === filters.tscircuit_handle
      );
    }
    if (orgs.length === 0) {
      return null;
    }
    const org = orgs[0];
    const orgAccount = get().orgAccounts.find(
      (oa) => oa.org_id === org.org_id && oa.account_id === auth?.account_id
    );
    const isOwner = org.owner_account_id === auth?.account_id;
    const member_count = get().accounts.filter(
      (account) => account.personal_org_id === org.org_id
    ).length;
    const package_count = get().packages.filter(
      (pkg) => pkg.owner_org_id === org.org_id
    ).length;
    const can_manage_org = isOwner ? true : orgAccount?.can_manage_org || false;
    return {
      ...org,
      member_count,
      package_count,
      can_manage_org
    };
  },
  addOrganizationAccount: (organizationAccount) => {
    const can_manage_org = organizationAccount.is_owner || false;
    const newOrgAccount = {
      org_account_id: `org_account_${get().idCounter + 1}`,
      org_id: organizationAccount.org_id,
      account_id: organizationAccount.account_id,
      is_owner: organizationAccount.is_owner || false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      can_manage_org
    };
    set((state) => ({
      orgAccounts: [...state.orgAccounts, newOrgAccount],
      idCounter: state.idCounter + 1
    }));
    return newOrgAccount;
  },
  getOrganizationAccount: (filters) => {
    const state = get();
    return state.orgAccounts.find((orgAccount) => {
      if (filters.org_id && orgAccount.org_id !== filters.org_id) {
        return false;
      }
      if (filters.account_id && orgAccount.account_id !== filters.account_id) {
        return false;
      }
      return true;
    });
  },
  getOrganizationAccounts: (filters) => {
    const state = get();
    return state.orgAccounts.filter((orgAccount) => {
      if (filters?.org_id && orgAccount.org_id !== filters.org_id) {
        return false;
      }
      if (filters?.account_id && orgAccount.account_id !== filters.account_id) {
        return false;
      }
      return true;
    });
  },
  removeOrganizationAccount: (filters) => {
    let removed = false;
    set((state) => {
      const index = state.orgAccounts.findIndex(
        (orgAccount) => orgAccount.org_id === filters.org_id && orgAccount.account_id === filters.account_id
      );
      if (index !== -1) {
        state.orgAccounts.splice(index, 1);
        removed = true;
      }
      return state;
    });
    return removed;
  },
  updateOrganizationAccount: (filters, updates) => {
    let updatedOrgAccount;
    set((state) => {
      const index = state.orgAccounts.findIndex(
        (orgAccount) => orgAccount.org_id === filters.org_id && orgAccount.account_id === filters.account_id
      );
      if (index === -1) return state;
      const updatedOrgAccounts = [...state.orgAccounts];
      updatedOrgAccounts[index] = {
        ...updatedOrgAccounts[index],
        ...updates
      };
      updatedOrgAccount = updatedOrgAccounts[index];
      return { ...state, orgAccounts: updatedOrgAccounts };
    });
    return updatedOrgAccount;
  },
  updateOrganization: (orgId, updates) => {
    let updatedOrg;
    set((state) => {
      const orgIndex = state.organizations.findIndex(
        (org) => org.org_id === orgId
      );
      if (orgIndex === -1) return state;
      const updatedOrganizations = [...state.organizations];
      updatedOrganizations[orgIndex] = {
        ...updatedOrganizations[orgIndex],
        ...updates
      };
      updatedOrg = updatedOrganizations[orgIndex];
      return { ...state, organizations: updatedOrganizations };
    });
    return updatedOrg;
  },
  deleteOrganization: (orgId) => {
    let deleted = false;
    set((state) => {
      const orgIndex = state.organizations.findIndex(
        (org) => org.org_id === orgId
      );
      if (orgIndex === -1) return state;
      const updatedOrganizations = [...state.organizations];
      updatedOrganizations.splice(orgIndex, 1);
      const updatedOrgAccounts = state.orgAccounts.filter(
        (orgAccount) => orgAccount.org_id !== orgId
      );
      deleted = true;
      return {
        ...state,
        organizations: updatedOrganizations,
        orgAccounts: updatedOrgAccounts
      };
    });
    return deleted;
  },
  deleteAccount: (accountId) => {
    let deleted = false;
    set((state) => {
      const accountIndex = state.accounts.findIndex(
        (account2) => account2.account_id === accountId
      );
      if (accountIndex === -1) return state;
      const account = state.accounts[accountIndex];
      const { personal_org_id, github_username } = account;
      const orgIdsToDelete = /* @__PURE__ */ new Set();
      if (personal_org_id) {
        orgIdsToDelete.add(personal_org_id);
      }
      const orgMemberCounts = state.orgAccounts.reduce(
        (acc, oa) => {
          acc[oa.org_id] = (acc[oa.org_id] || 0) + 1;
          return acc;
        },
        {}
      );
      const userOrgIds = state.orgAccounts.filter((oa) => oa.account_id === accountId).map((oa) => oa.org_id);
      for (const orgId of userOrgIds) {
        if (orgMemberCounts[orgId] === 1) {
          orgIdsToDelete.add(orgId);
        }
      }
      const packageIdsToDelete = state.packages.filter((pkg) => orgIdsToDelete.has(pkg.owner_org_id)).map((pkg) => pkg.package_id);
      const releaseIdsToDelete = state.packageReleases.filter((rel) => packageIdsToDelete.includes(rel.package_id)).map((rel) => rel.package_release_id);
      deleted = true;
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.account_id !== accountId),
        organizations: state.organizations.filter(
          (org) => !orgIdsToDelete.has(org.org_id)
        ),
        orgAccounts: state.orgAccounts.filter(
          (oa) => !orgIdsToDelete.has(oa.org_id) && oa.account_id !== accountId
        ),
        packages: state.packages.filter(
          (pkg) => !packageIdsToDelete.includes(pkg.package_id)
        ),
        packageReleases: state.packageReleases.filter(
          (rel) => !releaseIdsToDelete.includes(rel.package_release_id)
        ),
        packageFiles: state.packageFiles.filter(
          (file) => !releaseIdsToDelete.includes(file.package_release_id)
        ),
        snippets: state.snippets.filter(
          (s) => s.owner_name !== github_username
        ),
        accountPackages: state.accountPackages.filter(
          (ap) => ap.account_id !== accountId
        ),
        sessions: state.sessions.filter((s) => s.account_id !== accountId),
        orgInvitations: state.orgInvitations.filter(
          (inv) => inv.inviter_account_id !== accountId && (!account.email || inv.invitee_email !== account.email)
        ),
        orders: state.orders.filter((o) => o.account_id !== accountId),
        orderQuotes: state.orderQuotes.filter(
          (oq) => oq.account_id !== accountId
        ),
        githubInstallations: state.githubInstallations.filter(
          (gi) => gi.account_id !== accountId
        ),
        bugReports: state.bugReports.filter(
          (br) => br.reporter_account_id !== accountId
        ),
        accountSnippets: state.accountSnippets.filter(
          (as) => as.account_id !== accountId
        )
      };
    });
    return deleted;
  },
  addOrgInvitation: (invitation) => {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const newInvitation = {
      org_invitation_id: `org_invitation_${get().idCounter + 1}`,
      org_id: invitation.org_id,
      invitee_email: invitation.invitee_email,
      inviter_account_id: invitation.inviter_account_id,
      invitation_token: invitation.invitation_token,
      is_link_invite: false,
      is_pending: true,
      is_accepted: false,
      is_expired: false,
      is_revoked: false,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: expiresAt.toISOString(),
      accepted_at: null,
      accepted_by_account_id: null
    };
    set((state) => ({
      orgInvitations: [...state.orgInvitations, newInvitation],
      idCounter: state.idCounter + 1
    }));
    return newInvitation;
  },
  getOrgInvitationByToken: (token) => {
    const state = get();
    return state.orgInvitations.find(
      (invitation) => invitation.invitation_token === token
    );
  },
  listOrgInvitations: (orgId) => {
    const state = get();
    return state.orgInvitations.filter(
      (invitation) => invitation.org_id === orgId
    );
  },
  updateOrgInvitation: (invitationId, updates) => {
    let updatedInvitation;
    set((state) => {
      const index = state.orgInvitations.findIndex(
        (inv) => inv.org_invitation_id === invitationId
      );
      if (index === -1) return state;
      const updatedInvitations = [...state.orgInvitations];
      updatedInvitations[index] = {
        ...updatedInvitations[index],
        ...updates
      };
      updatedInvitation = updatedInvitations[index];
      return { ...state, orgInvitations: updatedInvitations };
    });
    return updatedInvitation;
  },
  addPackageDomain: (domain) => {
    const newDomain = packageDomainSchema.parse({
      package_domain_id: crypto.randomUUID(),
      created_at: /* @__PURE__ */ new Date(),
      ...domain
    });
    set((state) => ({
      packageDomains: [...state.packageDomains, newDomain]
    }));
    return newDomain;
  },
  getPackageDomainById: (packageDomainId) => {
    const state = get();
    return state.packageDomains.find(
      (pd) => pd.package_domain_id === packageDomainId
    );
  },
  getPackageDomainByFQDN: (fullyQualifiedDomainName) => {
    const state = get();
    return state.packageDomains.find(
      (pd) => pd.fully_qualified_domain_name === fullyQualifiedDomainName
    );
  },
  addOrgDomain: (domain) => {
    const newDomain = orgDomainSchema.parse({
      org_domain_id: crypto.randomUUID(),
      created_at: /* @__PURE__ */ new Date(),
      ...domain
    });
    set((state) => ({
      orgDomains: [...state.orgDomains, newDomain]
    }));
    return newDomain;
  },
  getOrgDomainById: (orgDomainId) => {
    const state = get();
    return state.orgDomains.find((od) => od.org_domain_id === orgDomainId);
  },
  getOrgDomainByFQDN: (fullyQualifiedDomainName) => {
    const state = get();
    return state.orgDomains.find(
      (od) => od.fully_qualified_domain_name === fullyQualifiedDomainName
    );
  },
  listOrgDomains: (filters) => {
    const state = get();
    let domains = state.orgDomains;
    if (filters?.org_id) {
      domains = domains.filter((od) => od.org_id === filters.org_id);
    }
    return [...domains].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  updateOrgDomain: (orgDomainId, updates) => {
    let updated;
    set((state) => {
      const index = state.orgDomains.findIndex(
        (od) => od.org_domain_id === orgDomainId
      );
      if (index === -1) return state;
      const orgDomains = [...state.orgDomains];
      orgDomains[index] = { ...orgDomains[index], ...updates };
      updated = orgDomains[index];
      return { ...state, orgDomains };
    });
    return updated;
  },
  addOrgDomainLinkedPackage: (linkedPackage) => {
    const newLinkedPackage = orgDomainLinkedPackageSchema.parse({
      org_domain_linked_package_id: crypto.randomUUID(),
      created_at: /* @__PURE__ */ new Date(),
      ...linkedPackage
    });
    set((state) => ({
      orgDomainLinkedPackages: [
        ...state.orgDomainLinkedPackages,
        newLinkedPackage
      ]
    }));
    return newLinkedPackage;
  },
  getOrgDomainLinkedPackageById: (orgDomainLinkedPackageId) => {
    const state = get();
    return state.orgDomainLinkedPackages.find(
      (lp) => lp.org_domain_linked_package_id === orgDomainLinkedPackageId
    );
  },
  listOrgDomainLinkedPackages: (orgDomainId) => {
    const state = get();
    return state.orgDomainLinkedPackages.filter((lp) => lp.org_domain_id === orgDomainId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },
  removeOrgDomainLinkedPackage: (orgDomainLinkedPackageId) => {
    let removed;
    set((state) => {
      const index = state.orgDomainLinkedPackages.findIndex(
        (lp) => lp.org_domain_linked_package_id === orgDomainLinkedPackageId
      );
      if (index === -1) return state;
      const orgDomainLinkedPackages = [...state.orgDomainLinkedPackages];
      removed = orgDomainLinkedPackages[index];
      orgDomainLinkedPackages.splice(index, 1);
      return { ...state, orgDomainLinkedPackages };
    });
    return removed;
  },
  deletePackageDomain: (packageDomainId) => {
    let deleted = false;
    set((state) => {
      const index = state.packageDomains.findIndex(
        (pd) => pd.package_domain_id === packageDomainId
      );
      if (index === -1) return state;
      const packageDomains = [...state.packageDomains];
      packageDomains.splice(index, 1);
      deleted = true;
      return { ...state, packageDomains };
    });
    return deleted;
  },
  updatePackageDomain: (packageDomainId, updates) => {
    let updated;
    set((state) => {
      const index = state.packageDomains.findIndex(
        (pd) => pd.package_domain_id === packageDomainId
      );
      if (index === -1) return state;
      const packageDomains = [...state.packageDomains];
      packageDomains[index] = { ...packageDomains[index], ...updates };
      updated = packageDomains[index];
      return { ...state, packageDomains };
    });
    return updated;
  }
}));

// fake-snippets-api/lib/middleware/with-db.ts
var withDb = async (req, ctx, next) => {
  if (!ctx.db) {
    ctx.db = createDatabase();
  }
  return next(req, ctx);
};
export {
  createDatabase,
  seed,
  withDb
};
