import * as zt from "fake-snippets-api/lib/db/schema"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"

const routeSpec = {
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      file_path: z.string(),
      is_release_tarball: z.boolean().optional().default(false),
      content_mimetype: z.string().optional(),
      content_text: z.string().optional(),
      content_base64: z.string().optional(),
      package_release_id: z.string().optional(),
      package_name_with_version: z.string().optional(),
      npm_pack_output: z.any().optional(),
    })
    .refine((v) => {
      if (v.package_release_id) return true
      if (v.package_name_with_version) return true
      return false
    }, "Must specify either package_release_id or package_name_with_version")
    .refine((v) => {
      if (v.package_release_id && v.package_name_with_version) return false
      return true
    }, "Cannot specify both package_release_id and package_name_with_version")
    .refine((v) => {
      if (v.content_base64 && v.content_text) return false
      if (!v.content_base64 && !v.content_text) return false
      return true
    }, "Either content_base64 or content_text is required"),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_file: zt.packageFileSchema,
  }),
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  const {
    file_path,
    content_mimetype: providedContentMimetype,
    content_base64,
    content_text,
    is_release_tarball,
    npm_pack_output,
  } = req.jsonBody

  if (is_release_tarball && !npm_pack_output) {
    return ctx.error(400, {
      error_code: "missing_options",
      message: "npm_pack_output is required for release tarballs",
    })
  }

  if (!is_release_tarball && npm_pack_output) {
    return ctx.error(404, {
      error_code: "invalid_options",
      message: "npm_pack_output is only valid for release tarballs",
    })
  }

  let packageReleaseId = req.jsonBody.package_release_id

  if (!packageReleaseId && req.jsonBody.package_name_with_version) {
    const foundPackageReleaseId = await findPackageReleaseId(
      { package_name_with_version: req.jsonBody.package_name_with_version },
      ctx,
    )
    if (foundPackageReleaseId) {
      packageReleaseId = foundPackageReleaseId
    }
  }

  if (!packageReleaseId) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Verify the package release exists
  const packageRelease = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === packageReleaseId,
  )

  if (!packageRelease) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Get the package to check permissions
  const existingPackage = ctx.db.packages.find(
    (p) => p.package_id === packageRelease.package_id,
  )

  if (!existingPackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  // Check if user has permission to create/update the file
  if (existingPackage.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to modify files in this package",
    })
  }

  // Check if file exists
  const exisitingFile = ctx.db.packageFiles.find(
    (pf) =>
      pf.package_release_id === packageReleaseId && pf.file_path === file_path,
  )

  // Determine content mimetype
  const contentMimetype =
    providedContentMimetype ||
    (file_path.endsWith(".ts") || file_path.endsWith(".tsx")
      ? "text/typescript"
      : null) ||
    (file_path.endsWith(".js") ? "application/javascript" : null) ||
    (file_path.endsWith(".json") ? "application/json" : null) ||
    (file_path.endsWith(".md") ? "text/markdown" : null) ||
    (file_path.endsWith(".html") ? "text/html" : null) ||
    (file_path.endsWith(".css") ? "text/css" : null) ||
    "application/octet-stream"

  if (exisitingFile) {
    const package_file = ctx.db.updatePackageFile(
      exisitingFile.package_file_id,
      {
        content_text:
          content_text ||
          (content_base64
            ? Buffer.from(content_base64, "base64").toString()
            : null),
        content_mimetype: contentMimetype,
        is_release_tarball: is_release_tarball || false,
        npm_pack_output: npm_pack_output || null,
      },
    )

    return ctx.json({
      ok: true,
      package_file,
    })
  }

  // Create the package file
  const newPackageFile = {
    package_file_id: crypto.randomUUID(),
    package_release_id: packageReleaseId,
    file_path,
    content_text:
      content_text ||
      (content_base64
        ? Buffer.from(content_base64, "base64").toString()
        : null),
    content_mimetype: contentMimetype,
    is_directory: false,
    is_release_tarball: is_release_tarball || false,
    npm_pack_output: npm_pack_output || null,
    created_at: new Date().toISOString(),
  }

  // Add to the test database
  ctx.db.addPackageFile(newPackageFile)

  return ctx.json({
    ok: true,
    package_file: newPackageFile,
  })
})
