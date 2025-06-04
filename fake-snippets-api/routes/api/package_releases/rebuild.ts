import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { packageReleaseSchema } from "fake-snippets-api/lib/db/schema"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_release: packageReleaseSchema,
  }),
})(async (req, ctx) => {
  const { package_release_id } = req.jsonBody

  const release = ctx.db.getPackageReleaseById(package_release_id)

  if (!release) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // In a real API this would trigger a rebuild. Here we simply return the release.
  return ctx.json({
    ok: true,
    package_release: release,
  })
})
