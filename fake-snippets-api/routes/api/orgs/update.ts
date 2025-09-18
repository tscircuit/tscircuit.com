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
        name: z.string().optional(),
        display_name: z.string().optional(),
      }),
    ),
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const { org_id, name, display_name } = req.commonParams as {
    org_id: string
    name?: string
    display_name?: string
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
  if (!name && display_name === undefined) {
    return ctx.json({ org: publicMapOrg(org) })
  }

  if (name && name !== org.github_handle) {
    // Validate duplicate name
    const duplicate = ctx.db.getOrg({ github_handle: name })

    if (duplicate && duplicate.org_id !== org_id) {
      return ctx.error(400, {
        error_code: "org_already_exists",
        message: "An organization with this name already exists",
      })
    }
  }

  const updates: {
    github_handle?: string
    org_display_name?: string
  } = {}

  if (name) {
    updates.github_handle = name
  }

  if (display_name !== undefined) {
    const trimmedDisplayName = display_name.trim()
    const fallbackDisplayName =
      name ?? org.org_display_name ?? org.github_handle ?? ""
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
