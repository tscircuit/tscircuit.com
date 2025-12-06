import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  commonParams: z.object({
    tscircuit_handle: z.string(),
    size: z.coerce.number().int().min(1).max(500).optional(),
  }),
  auth: "none",
  rawResponse: true,
})(async (req, ctx) => {
  const { tscircuit_handle, size } = req.commonParams

  const org = ctx.db.getOrg({ tscircuit_handle })

  if (!org) {
    return new Response("Organization not found", { status: 404 })
  }

  if (org.avatar_url) {
    const match = org.avatar_url.match(/^data:([^;]+);base64,(.+)$/)
    if (match) {
      const [, mimeType, base64Data] = match
      const buffer = Buffer.from(base64Data, "base64")
      return new Response(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=3600",
        },
      })
    }
    return Response.redirect(org.avatar_url, 302)
  }

  if (org.github_handle) {
    const sizeParam = size ? `?s=${size}` : ""
    return Response.redirect(
      `https://github.com/${org.github_handle}.png${sizeParam}`,
      302,
    )
  }

  return new Response("No avatar found", { status: 404 })
})
