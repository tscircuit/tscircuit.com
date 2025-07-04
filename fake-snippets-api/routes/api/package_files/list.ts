import * as ZT from "fake-snippets-api/lib/db/schema"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

const routeSpec = {
  methods: ["POST"],
  auth: "none",
  jsonBody: z
    .object({
      package_release_id: z.string(),
    })
    .or(
      z.object({
        package_name: z.string(),
        use_latest_version: z.literal(true),
      }),
    )
    .or(
      z.object({
        package_name_with_version: z.string(),
      }),
    ),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_files: z.array(ZT.packageFileSchema),
  }),
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  const packageReleaseId = await findPackageReleaseId(req.jsonBody, ctx)

  if (!packageReleaseId) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Omit the content_text field
  const packageFiles = ctx.db.packageFiles
    .filter((file) => file.package_release_id === packageReleaseId)
    .map(({ content_text, ...file }) => ({
      ...file,
    }))

  return ctx.json({
    ok: true,
    package_files: packageFiles,
  })
})
