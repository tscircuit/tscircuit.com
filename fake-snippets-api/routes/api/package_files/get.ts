import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"
import * as ZT from "fake-snippets-api/lib/db/schema"
import { getPackageFileIdFromFileDescriptor } from "fake-snippets-api/lib/package_file/get-package-file-id-from-file-descriptor"

const routeSpec = {
  methods: ["POST"],
  auth: "none",
  jsonBody: z
    .object({
      package_file_id: z.string(),
    })
    .or(
      z.object({
        package_release_id: z.string(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_id: z.string(),
        version: z.string().optional(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_name: z.string(),
        version: z.string().optional(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_name_with_version: z.string(),
        file_path: z.string(),
      }),
    ),
  jsonResponse: z
    .object({
      ok: z.boolean(),
      package_file: ZT.packageFileSchema.optional(),
    })
    .or(ZT.errorResponseSchema),
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  const packageFileId = await getPackageFileIdFromFileDescriptor(req.jsonBody, ctx)

  const packageFile = ctx.db.packageFiles.find(
    (pf: ZT.PackageFile) => pf.package_file_id === packageFileId,
  )

  if (!packageFile) {
    return ctx.error(404, {
      error_code: "package_file_not_found",
      message: "Package file not found",
    })
  }

  return ctx.json({
    ok: true,
    package_file: {
      ...packageFile,
      created_at: packageFile.created_at.toString(),
    },
  })
})
