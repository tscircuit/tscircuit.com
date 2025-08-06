import { z } from "zod"
import { packageSchema } from "../../../lib/db/schema"
import { withRouteSpec } from "../../../lib/middleware/with-winter-spec"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      package_id: z.string(),
      name: z
        .string()
        .regex(
          /^[@a-zA-Z0-9-_\/]+$/,
          "Package name can only contain letters, numbers, hyphens, underscores, and forward slashes",
        )
        .transform((name) => name.replace(/^@/, ""))
        .optional(),
      description: z.string().optional(),
      website: z.string().optional(),
      github_repo_full_name: z.string().nullable().optional(),
      is_private: z.boolean().optional(),
      is_unlisted: z.boolean().optional(),
      default_view: z.enum(["files", "3d", "pcb", "schematic"]).optional(),
      allow_pr_previews: z.boolean().optional(),
    })
    .transform((data) => ({
      ...data,
      is_unlisted: data.is_private ? true : data.is_unlisted,
    })),
  jsonResponse: z.object({
    ok: z.boolean(),
    package: packageSchema,
  }),
})(async (req, ctx) => {
  const {
    package_id,
    name,
    description,
    website,
    is_private,
    is_unlisted,
    github_repo_full_name,
    default_view,
    allow_pr_previews,
  } = req.jsonBody

  const packageIndex = ctx.db.packages.findIndex(
    (p) => p.package_id === package_id,
  )

  if (packageIndex === -1) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const existingPackage = ctx.db.packages[packageIndex]

  // Check if user has permission to update the package
  if (existingPackage.owner_github_username !== ctx.auth.github_username) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You don't have permission to update this package",
    })
  }

  // Check for duplicate package name if name is being updated
  if (name) {
    const newFullName = `${ctx.auth.github_username}/${name}`
    const duplicatePackage = ctx.db.packages.find(
      (p) => p.name === newFullName && p.package_id !== package_id,
    )
    if (duplicatePackage) {
      return ctx.error(400, {
        error_code: "package_already_exists",
        message: "A package with this name already exists",
      })
    }
  }

  const updatedPackage = ctx.db.updatePackage(package_id, {
    name: name ? `${ctx.auth.github_username}/${name}` : existingPackage.name,
    description: description ?? existingPackage.description,
    unscoped_name: name ?? existingPackage.unscoped_name,
    website: website ?? existingPackage.website,
    github_repo_full_name:
      github_repo_full_name === null
        ? null
        : (github_repo_full_name ?? existingPackage.github_repo_full_name),
    is_private: is_private ?? existingPackage.is_private,
    is_public:
      is_private !== undefined ? !is_private : existingPackage.is_public,
    is_unlisted: is_unlisted ?? existingPackage.is_unlisted,
    default_view: default_view ?? existingPackage.default_view,
    updated_at: new Date().toISOString(),
    allow_pr_previews: allow_pr_previews ?? existingPackage.allow_pr_previews,
  })

  if (!updatedPackage) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update package",
    })
  }

  return ctx.json({
    ok: true,
    package: updatedPackage,
  })
})
