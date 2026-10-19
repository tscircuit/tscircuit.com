import {
  packageFileSchema,
  type PackageFile,
} from "fake-snippets-api/lib/db/schema"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  normalizeProjectFilePath,
  normalizeProjectFilePathAndValidate,
} from "fake-snippets-api/utils/normalizeProjectFilePath"
import { gunzipSync } from "node:zlib"
import { z } from "zod"

const archiveSchema = z.object({
  files: z
    .array(
      z
        .object({
          file_path: z.string(),
          content_text: z.string().optional(),
          content_base64: z.string().optional(),
          content_mimetype: z.string().optional(),
        })
        .refine((file) => !(file.content_text && file.content_base64), {
          message: "content_text and content_base64 cannot both be provided",
        }),
    )
    .min(1),
})

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      package_release_id: z.string().optional(),
      package_name_with_version: z.string().optional(),
      archive_base64: z.string(),
    })
    .refine(
      (body) =>
        Boolean(body.package_release_id) !==
        Boolean(body.package_name_with_version),
      {
        message:
          "Specify either package_release_id or package_name_with_version",
      },
    ),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_files: z.array(packageFileSchema),
  }),
})(async (req, ctx) => {
  const packageReleaseId = await findPackageReleaseId(req.jsonBody, ctx)
  const release = ctx.db.packageReleases.find(
    (release) => release.package_release_id === packageReleaseId,
  )
  if (!release)
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  const pkg = ctx.db.packages.find(
    (pkg) => pkg.package_id === release.package_id,
  )
  if (!pkg)
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  if (
    pkg.creator_account_id !== ctx.auth.account_id &&
    !ctx.auth.orgs.some(
      (org) =>
        org.org_id === pkg.owner_org_id &&
        org.user_permissions.can_manage_packages,
    )
  ) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to modify files in this package",
    })
  }

  let files: Omit<PackageFile, "package_file_id">[]
  try {
    const archive = archiveSchema.parse(
      JSON.parse(
        gunzipSync(Buffer.from(req.jsonBody.archive_base64, "base64")).toString(
          "utf8",
        ),
      ),
    )
    files = archive.files.map((file) => ({
      package_release_id: release.package_release_id,
      file_path: normalizeProjectFilePathAndValidate(file.file_path),
      is_text: file.content_text !== undefined,
      content_text: file.content_text ?? null,
      content_bytes:
        file.content_text !== undefined
          ? Buffer.from(file.content_text)
          : Buffer.from(file.content_base64 ?? "", "base64"),
      content_mimetype: file.content_mimetype ?? "application/octet-stream",
      created_at: new Date().toISOString(),
    }))
  } catch {
    return ctx.error(400, {
      error_code: "invalid_archive",
      message: "Archive must be gzipped JSON containing valid package files",
    })
  }

  const package_files = files.map((file) => {
    const existing = ctx.db.packageFiles.find(
      (existing) =>
        existing.package_release_id === release.package_release_id &&
        normalizeProjectFilePath(existing.file_path) === file.file_path,
    )
    return existing
      ? ctx.db.updatePackageFile(existing.package_file_id, file)
      : ctx.db.addPackageFile(file)
  })
  ctx.db.updatePackageRelease({
    ...release,
    ready_to_build: true,
  })
  ctx.db.updatePackageReleaseFsSha(release.package_release_id)
  return ctx.json({ ok: true, package_files })
})
