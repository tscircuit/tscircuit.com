import { packageFileSchema } from "fake-snippets-api/lib/db/schema"
import { findPackageReleaseId } from "fake-snippets-api/lib/package_release/find-package-release-id"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  normalizeProjectFilePath,
  normalizeProjectFilePathAndValidate,
} from "fake-snippets-api/utils/normalizeProjectFilePath"
import mime from "mime-types"
import { gunzipSync } from "node:zlib"
import { z } from "zod"

const archiveFileSchema = z
  .object({
    file_path: z.string(),
    content_mimetype: z.string().optional(),
    content_text: z.string().optional(),
    content_base64: z.string().optional(),
  })
  .refine((v) => !(v.content_text && v.content_base64), {
    message: "content_text and content_base64 cannot both be provided",
  })

const archiveSchema = z.object({
  files: z.array(archiveFileSchema).min(1),
})

const commonRequestBaseSchema = z.object({
  package_release_id: z.string().uuid().optional(),
  package_name_with_version: z
    .string()
    .regex(/^.+@.+/)
    .optional(),
})

const commonRequestSchema = commonRequestBaseSchema
  .refine((v) => v.package_release_id || v.package_name_with_version, {
    message:
      "Must specify either package_release_id or package_name_with_version",
  })
  .refine((v) => !(v.package_release_id && v.package_name_with_version), {
    message:
      "Cannot specify both package_release_id and package_name_with_version",
  })

const jsonRequestSchema = commonRequestBaseSchema
  .extend({
    archive_base64: z.string(),
  })
  .refine((v) => v.package_release_id || v.package_name_with_version, {
    message:
      "Must specify either package_release_id or package_name_with_version",
  })
  .refine((v) => !(v.package_release_id && v.package_name_with_version), {
    message:
      "Cannot specify both package_release_id and package_name_with_version",
  })

type ParsedRequest = {
  package_release_id?: string
  package_name_with_version?: string
  archiveBuffer: Buffer
}

const parseJsonRequest = async (
  req: Request,
): Promise<ParsedRequest | null> => {
  const parsedJson = jsonRequestSchema.safeParse(
    await req.json().catch(() => null),
  )
  if (!parsedJson.success) return null

  const archiveBuffer = Buffer.from(parsedJson.data.archive_base64, "base64")

  return {
    package_release_id: parsedJson.data.package_release_id,
    package_name_with_version: parsedJson.data.package_name_with_version,
    archiveBuffer,
  }
}

const parseMultipartRequest = async (
  req: Request,
): Promise<ParsedRequest | null> => {
  const formData = await req.formData().catch(() => null)
  if (!formData) return null

  const package_release_id = formData.get("package_release_id")
  const package_name_with_version = formData.get("package_name_with_version")
  const archive_base64 = formData.get("archive_base64")
  const archiveFile = formData.get("archive")

  const parsedCommon = commonRequestSchema.safeParse({
    package_release_id:
      typeof package_release_id === "string" ? package_release_id : undefined,
    package_name_with_version:
      typeof package_name_with_version === "string"
        ? package_name_with_version
        : undefined,
  })

  if (!parsedCommon.success) return null

  let archiveBuffer: Buffer | null = null
  if (typeof archive_base64 === "string") {
    archiveBuffer = Buffer.from(archive_base64, "base64")
  } else if (archiveFile && typeof archiveFile !== "string") {
    archiveBuffer = Buffer.from(await archiveFile.arrayBuffer())
  }

  if (!archiveBuffer) return null

  return {
    ...parsedCommon.data,
    archiveBuffer,
  }
}

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonResponse: z.object({
    ok: z.boolean(),
    package_files: z.array(packageFileSchema),
  }),
})(async (req, ctx) => {
  const contentType = req.headers.get("content-type") || ""

  const parsedRequest = contentType.includes("multipart/form-data")
    ? await parseMultipartRequest(req)
    : await parseJsonRequest(req)

  if (!parsedRequest) {
    return ctx.error(400, {
      error_code: "invalid_upload_payload",
      message:
        "Expected JSON with archive_base64 or multipart/form-data with archive file",
    })
  }

  const package_release_id =
    parsedRequest.package_release_id ??
    (await findPackageReleaseId(parsedRequest.package_name_with_version!, ctx))
  const release = ctx.db.packageReleases.find(
    (release) => release.package_release_id === package_release_id,
  )
  const pkg =
    release &&
    ctx.db.packages.find((pkg) => pkg.package_id === release.package_id)
  if (!release || !pkg) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }
  const canManagePackage =
    ctx.auth.personal_org_id === pkg.owner_org_id ||
    ctx.auth.orgs.some(
      (org) =>
        org.org_id === pkg.owner_org_id &&
        org.user_permissions.can_manage_packages,
    )
  if (!canManagePackage) {
    return ctx.error(403, {
      error_code: "forbidden",
      message:
        "You do not have permission to add files to this package release",
    })
  }

  let archiveContent: unknown
  try {
    const uncompressed = gunzipSync(parsedRequest.archiveBuffer)
    archiveContent = JSON.parse(uncompressed.toString("utf8"))
  } catch {
    return ctx.error(400, {
      error_code: "invalid_archive",
      message:
        "archive must be a gzipped JSON payload containing a files array",
    })
  }

  const parsedArchive = archiveSchema.safeParse(archiveContent)
  if (!parsedArchive.success) {
    return ctx.error(400, {
      error_code: "invalid_archive",
      message: "Archive payload is invalid",
    })
  }

  const filesToUpload = parsedArchive.data.files.map((file) => {
    const normalizedFilePath = normalizeProjectFilePathAndValidate(
      file.file_path,
    )
    const content_mimetype =
      file.content_mimetype ||
      (normalizedFilePath.endsWith(".ts") || normalizedFilePath.endsWith(".tsx")
        ? "text/typescript"
        : null) ||
      mime.lookup(normalizedFilePath) ||
      "application/octet-stream"

    const decodedContent =
      file.content_text !== undefined
        ? Buffer.from(file.content_text)
        : file.content_base64 !== undefined
          ? Buffer.from(file.content_base64, "base64")
          : Buffer.from("")

    return {
      file_path: normalizedFilePath,
      content_text: file.content_text,
      content_bytes: decodedContent,
      content_mimetype,
      is_text: file.content_text !== undefined,
    }
  })

  // PostgreSQL rejects duplicate conflict keys within one INSERT before committing.
  if (
    new Set(filesToUpload.map((file) => file.file_path)).size !==
    filesToUpload.length
  ) {
    throw new Error(
      "ON CONFLICT DO UPDATE command cannot affect row a second time",
    )
  }

  const package_files = filesToUpload.map((file) => {
    const values = {
      ...file,
      content_text: file.content_text ?? null,
      package_release_id: release.package_release_id,
      is_release_tarball: false,
      npm_pack_output: null,
      created_at: new Date().toISOString(),
    }
    const existing = ctx.db.packageFiles.find(
      (existing) =>
        existing.package_release_id === release.package_release_id &&
        normalizeProjectFilePath(existing.file_path) === file.file_path,
    )
    const saved = existing
      ? ctx.db.updatePackageFile(existing.package_file_id, values)
      : ctx.db.addPackageFile(values)
    return {
      package_file_id: saved.package_file_id,
      package_release_id: saved.package_release_id,
      content_mimetype: saved.content_mimetype,
      file_path: saved.file_path,
      created_at: saved.created_at,
    }
  })

  ctx.db.updatePackageRelease({
    ...release,
    pcb_trace_count: null,
    circuit_json_build_error: null,
    circuit_json_build_error_last_updated_at: null,
    circuit_json_build_is_stale: true,
    image_generation_is_stale: true,
    image_generation_error: null,
    image_generation_error_last_updated_at: null,
    image_generation_in_progress: false,
    image_generation_started_at: null,
    image_generation_completed_at: null,
    image_generation_logs: [],
    transpilation_is_stale: true,
    has_transpiled: false,
    transpilation_error: null,
    transpilation_in_progress: false,
    transpilation_started_at: null,
    transpilation_completed_at: null,
    transpilation_logs: [],
    ready_to_build: true,
    active_package_build_id: null,
  })
  for (const file of ctx.db.packageFiles.filter(
    (file) =>
      file.package_release_id === release.package_release_id &&
      normalizeProjectFilePath(file.file_path) === "dist/circuit.json",
  )) {
    ctx.db.deletePackageFile(file.package_file_id)
  }
  ctx.db.updatePackageReleaseFsSha(release.package_release_id)
  ctx.db.updatePackage(pkg.package_id, { updated_at: new Date().toISOString() })
  return ctx.json({ ok: true, package_files })
})
