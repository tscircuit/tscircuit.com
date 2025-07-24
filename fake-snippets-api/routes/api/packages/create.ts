import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    name: z
      .string()
      .regex(
        /^[@a-zA-Z0-9-_\/]+$/,
        "Package name can only contain letters, numbers, hyphens, underscores, and forward slashes",
      )
      .transform((name) => name.replace(/^@/, ""))
      .optional(),
    description: z.string().optional(),
    is_private: z.boolean().optional().default(false),
    is_unlisted: z.boolean().optional().default(false),
  }),
  jsonResponse: z.object({
    package: packageSchema.optional(),
  }),
})(async (req, ctx) => {
  const { name, description, is_private, is_unlisted } = req.jsonBody

  const existingPackage = ctx.db.packages.find((pkg) => pkg.name === name)

  if (existingPackage) {
    throw ctx.error(400, {
      error_code: "package_already_exists",
      message: "A package with this name already exists",
    })
  }

  let unscoped_name = name
  if (!unscoped_name) {
    const state = ctx.db.getState()
    const count = state.packages.filter(
      (pkg) => pkg.creator_account_id === ctx.auth.account_id,
    ).length

    unscoped_name = `untitled-package-${count}`
  }

  const newPackage = ctx.db.addPackage({
    name: `${ctx.auth.github_username}/${String(unscoped_name)}`,
    description: description ?? null,
    creator_account_id: ctx.auth.account_id,
    owner_org_id: ctx.auth.personal_org_id,
    owner_github_username: ctx.auth.github_username,
    latest_package_release_id: null,
    latest_package_release_fs_sha: null,
    latest_version: null,
    license: null,
    website: null,
    is_source_from_github: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unscoped_name,
    star_count: 0,
    ai_description: "placeholder ai description",
    is_private: is_private ?? false,
    is_public: is_private === true ? false : true,
    is_unlisted: is_private === true ? true : (is_unlisted ?? false),
    ai_usage_instructions: "placeholder ai usage instructions",
    default_view: "files",
  })

  if (!newPackage) {
    throw new Error("Failed to create package")
  }

  return ctx.json({
    package: publicMapPackage(newPackage),
  })
})
