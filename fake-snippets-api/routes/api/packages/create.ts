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

  let owner_segment = name?.split("/")[0]
  let unscoped_name = name?.split("/")[1]

  if (name && !unscoped_name) {
    throw ctx.error(400, {
      error_code: "invalid_package_name",
      message:
        "Package name must include an author segment (e.g. author/package_name)",
    })
  }

  if (!unscoped_name) {
    const state = ctx.db.getState()
    const count = state.packages.filter(
      (pkg) => pkg.creator_account_id === ctx.auth.account_id,
    ).length

    unscoped_name = `untitled-package-${count}`
  }

  if (!owner_segment) {
    owner_segment = ctx.auth.github_username
  }

  const final_name = name ?? `${owner_segment}/${unscoped_name}`

  const requested_owner_lower = owner_segment.toLowerCase()
  const personal_owner_lower = ctx.auth.github_username.toLowerCase()

  let owner_org_id = ctx.auth.personal_org_id
  let owner_github_username = ctx.auth.github_username

  if (requested_owner_lower !== personal_owner_lower) {
    const state = ctx.db.getState()
    const memberOrg = state.orgAccounts
      .filter((oa) => oa.account_id === ctx.auth.account_id)
      .map((oa) => state.organizations.find((o) => o.org_id === oa.org_id))
      .filter((o): o is NonNullable<typeof o> => o !== undefined)
      .find(
        (o) =>
          o.org_display_name?.toLowerCase() === requested_owner_lower ||
          o.github_handle?.toLowerCase() === requested_owner_lower,
      )

    if (!memberOrg) {
      throw ctx.error(403, {
        error_code: "forbidden",
        message:
          "You must be a member of the organization to create a package under it",
      })
    }

    owner_org_id = memberOrg.org_id
    owner_github_username = memberOrg.github_handle
  }

  const existingPackage = ctx.db.packages.find((pkg) => pkg.name === final_name)

  if (existingPackage) {
    throw ctx.error(400, {
      error_code: "package_already_exists",
      message: "A package with this name already exists",
    })
  }

  const newPackage = ctx.db.addPackage({
    name: final_name,
    description: description ?? null,
    creator_account_id: ctx.auth.account_id,
    owner_org_id,
    owner_github_username,
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
