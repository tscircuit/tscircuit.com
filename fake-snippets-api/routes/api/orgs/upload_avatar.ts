import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { publicOrgSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapOrg } from "fake-snippets-api/lib/public-mapping/public-map-org"

const MAX_AVATAR_BYTES = 5 * 1024 * 1024 // 5MB

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonResponse: z.object({
    org: publicOrgSchema,
  }),
})(async (req, ctx) => {
  const formData = await req.formData().catch(() => null)

  if (!formData) {
    return ctx.error(400, {
      error_code: "invalid_form_data",
      message: "Expected multipart form data",
    })
  }

  const orgIdValue = formData.get("org_id")
  const avatarFile = formData.get("avatar")

  if (!orgIdValue || typeof orgIdValue !== "string") {
    return ctx.error(400, {
      error_code: "missing_org_id",
      message: "org_id is required",
    })
  }

  const org = ctx.db.getOrg({ org_id: orgIdValue }, ctx.auth)

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

  if (!(avatarFile instanceof File)) {
    return ctx.error(400, {
      error_code: "missing_avatar",
      message: "An avatar file is required",
    })
  }

  const mimeType = (avatarFile.type && avatarFile.type.trim()) || "image/png"

  if (!mimeType.startsWith("image/")) {
    return ctx.error(400, {
      error_code: "invalid_avatar_type",
      message: "Avatar must be an image",
    })
  }

  const avatarBuffer = Buffer.from(await avatarFile.arrayBuffer())

  if (avatarBuffer.byteLength === 0) {
    return ctx.error(400, {
      error_code: "empty_avatar",
      message: "Avatar file is empty",
    })
  }

  if (avatarBuffer.byteLength > MAX_AVATAR_BYTES) {
    return ctx.error(413, {
      error_code: "avatar_too_large",
      message: "Avatar file is too large",
    })
  }

  const base64 = avatarBuffer.toString("base64")
  const dataUrl = `data:${mimeType};base64,${base64}`

  const updated = ctx.db.updateOrganization(orgIdValue, {
    avatar_url: dataUrl,
  })

  if (!updated) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update organization",
    })
  }

  const updatedOrg = ctx.db.getOrg({ org_id: orgIdValue }, ctx.auth)

  return ctx.json({
    org: publicMapOrg(updatedOrg!),
  })
})
