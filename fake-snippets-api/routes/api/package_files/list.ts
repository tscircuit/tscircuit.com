import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"
import * as ZT from "fake-snippets-api/lib/db/schema"

const routeSpec = {
  methods: ["POST"],
  auth: "none",
  jsonBody: z
    .object({
      package_release_id: z.string().uuid(),
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
  // const package_release_id = await findPackageReleaseId(req.jsonBody, ctx)
  // if (!package_release_id) {
  //   return ctx.error(404, {
  //     error_code: "package_release_not_found",
  //     message: "Package release not found",
  //   })
  // }
  // const package_files = await ctx.db
  //   .selectFrom("main.package_file")
  //   .select([
  //     "package_file_id",
  //     "package_release_id",
  //     "content_mimetype",
  //     "file_path",
  //     "created_at",
  //   ])
  //   .where("package_release_id", "=", package_release_id)
  //   .where("file_path", "not like", ".tscircuit-internal/%")
  //   .execute()
  // return ctx.json({
  //   ok: true,
  //   package_files: package_files.map((pf) => ({
  //     ...pf,
  //     created_at: pf.created_at.toISOString(),
  //   })),
  // })
  return ctx.json({
    // TODO
  })
})
