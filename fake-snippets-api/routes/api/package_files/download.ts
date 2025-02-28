import { getPackageFileIdFromFileDescriptor } from "fake-snippets-api/lib/package_file/get-package-file-id-from-file-descriptor"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

const routeSpec = {
  methods: ["GET", "POST"],
  auth: "none",
  queryParams: z
    .object({
      package_file_id: z.string(),
    })
    .or(
      z.object({
        package_name_with_version: z.string(),
        file_path: z.string(),
      }),
    ),
  jsonResponse: z.any(), // Using any because we're returning binary data
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  let packageFileId: string | undefined
  const params = req.query

  if ("package_file_id" in params) {
    packageFileId = params.package_file_id
  } else if ("package_name_with_version" in params) {
    const { package_name_with_version, file_path } = params

    const packageReleaseId = await findPackageReleaseId(
      package_name_with_version,
      ctx
    )

    if (!packageReleaseId) {
      return ctx.error(404, {
        error_code: "not_found",
        message: "Package release not found",
      })
    }

    try {
      packageFileId = await getPackageFileIdFromFileDescriptor(
        {
          package_release_id: packageReleaseId,
          file_path: file_path,
        },
        ctx
      )
    } catch (error) {
      return ctx.error(404, {
        error_code: "not_found",
        message: "Package file not found",
      })
    }
  }

  if (!packageFileId) {
    return ctx.error(400, {
      error_code: "bad_request",
      message: "Could not determine package_file_id",
    })
  }

  const packageFile = ctx.db.packageFiles.find(
    (pf) => pf.package_file_id === packageFileId
  )

  if (!packageFile) {
    return ctx.error(404, {
      error_code: "not_found",
      message: "Package file not found",
    })
  }

  const contentType = "text/plain"
  
  const headers = {
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${packageFile.file_path.split('/').pop()}"`,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    Expires: new Date(Date.now() + 86400000).toUTCString(),
  }

  return new Response(packageFile.content_text, { headers })
})
