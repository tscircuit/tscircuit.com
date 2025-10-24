import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  commonParams: z
    .object({
      org_id: z.string(),
    })
    .and(
      z.object({
        name: z.string().min(5).max(40).optional(),
        display_name: z.string().max(50).optional(),
        github_handle: z.string().trim().min(1).nullable().optional(),
      }),
    ),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { org_id, name, display_name, github_handle } = req.commonParams as {
    org_id: string
    name?: string
    display_name?: string
    github_handle?: string
  }

  const org = ctx.db.getOrg({ org_id }, ctx.auth)

  if (!org) {
    return ctx.error(404, {
      error_code: "org_not_found",
      message: "Organization not found",
    })
  }

  if (!org.can_manage_org) {
    return ctx.error(403, {
      error_code: "not_authorized",
      message: "You do not have permission to manage this organization",
    })
  }

  // No changes provided
  if (!name && display_name === undefined && github_handle === null) {
    return ctx.json({ org: publicMapOrg(org) })
  }

  if (name && name !== org.org_name) {
    // Validate duplicate name
    const duplicate = ctx.db.getOrg({ org_name: name })

    if (duplicate && duplicate.org_id !== org_id) {
      return ctx.error(400, {
        error_code: "org_already_exists",
        message: "An organization with this name already exists",
      })
    }
  }
  if (
    github_handle !== undefined &&
    github_handle !== org.github_handle &&
    github_handle !== null
  ) {
    const duplicateHandle = ctx.db.getOrg({ github_handle })
      ? ctx.db.getOrg({ github_handle })?.org_id != org_id
      : false

    if (duplicateHandle) {
      return ctx.error(400, {
        error_code: "org_github_handle_already_exists",
        message: "An organization with this GitHub handle already exists",
      })
    }
  }
  const updates: {
    org_name?: string
    org_display_name?: string
    github_handle?: string
  } = {}

  if (name) {
    updates.org_name = name // TODO NORMALISE
  }

  if (github_handle !== undefined) {
    updates.github_handle = github_handle
  }

  if (display_name !== undefined) {
    const trimmedDisplayName = display_name.trim()
    const handleForFallback =
      github_handle !== undefined ? github_handle : org.github_handle
    const fallbackDisplayName =
      name ?? org.org_display_name ?? org.org_name ?? handleForFallback ?? ""
    updates.org_display_name =
      trimmedDisplayName.length > 0 ? trimmedDisplayName : fallbackDisplayName
  }

  const updated = ctx.db.updateOrganization(org_id, updates)

  if (!updated) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update organization",
    })
  }

  const updatedOrgWithPermissions = ctx.db.getOrg({ org_id }, ctx.auth)

  return ctx.json({
    org: publicMapOrg(updatedOrgWithPermissions!),
  })
})
