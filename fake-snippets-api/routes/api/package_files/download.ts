import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  normalizeProjectFilePath,
  normalizeProjectFilePathAndValidate,
} from "fake-snippets-api/utils/normalizeProjectFilePath"
import { z } from "zod"

const routeSpec = {
  methods: ["GET", "POST"],
  auth: "none",
  queryParams: z
    .object({
      package_file_id: z.string(),
      package_name: z.string().optional(),
    })
    .or(
      z.object({
        package_name_with_version: z.string(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_release_id: z.string(),
        file_path: z.string(),
        package_name: z.string().optional(),
      }),
    ),
  jsonResponse: z.any(),
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  let package_file_id: string | undefined
  const params = req.query

  if ("package_file_id" in params) {
    package_file_id = params.package_file_id
  } else if ("package_name_with_version" in params) {
    const { package_name_with_version, file_path } = params

    const package_release_id = await findPackageReleaseId(
      package_name_with_version,
      ctx,
    )

    if (!package_release_id) {
      return ctx.error(404, {
        error_code: "not_found",
        message: "Package release not found",
      })
    }

    const normalizedPath = normalizeProjectFilePathAndValidate(file_path)
    const packageFile = ctx.db.packageFiles.find(
      (pf) =>
        pf.package_release_id === package_release_id &&
        normalizeProjectFilePath(pf.file_path) === normalizedPath,
    )

    if (!packageFile) {
      return ctx.error(404, {
        error_code: "not_found",
        message: "Package file not found",
      })
    }

    package_file_id = packageFile.package_file_id
  } else if ("package_release_id" in params) {
    const { package_release_id, file_path } = params

    const normalizedPath = normalizeProjectFilePathAndValidate(file_path)
    const packageFile = ctx.db.packageFiles.find(
      (pf) =>
        pf.package_release_id === package_release_id &&
        normalizeProjectFilePath(pf.file_path) === normalizedPath,
    )

    if (!packageFile) {
      return ctx.error(404, {
        error_code: "not_found",
        message: "Package file not found",
      })
    }

    package_file_id = packageFile.package_file_id
  }

  if (!package_file_id) {
    return ctx.error(400, {
      error_code: "bad_request",
      message: "Could not determine package_file_id",
    })
  }

  const packageFile = ctx.db.packageFiles.find(
    (pf) => pf.package_file_id === package_file_id,
  )

  if (!packageFile) {
    return ctx.error(404, {
      error_code: "not_found",
      message: "Package file not found",
    })
  }

  const extension = packageFile.file_path.includes(".")
    ? `.${packageFile.file_path.split(".").pop()}`
    : ""
  const filename = `${packageFile.package_file_id}${extension}`

  const headers = {
    "Content-Type":
      packageFile.content_mimetype ||
      (packageFile.content_text
        ? "application/javascript"
        : "application/octet-stream"),
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    Expires: new Date(Date.now() + 86400000).toUTCString(),
  }

  return new Response(
    packageFile.content_text || (packageFile.content_bytes as BodyInit),
    {
      headers,
    },
  )
})
