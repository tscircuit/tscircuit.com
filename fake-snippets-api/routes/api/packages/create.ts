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
      .transform((name) => name.replace(/^@/, "")),
    description: z.string().optional(),
  }),
  jsonResponse: z.object({
    package: packageSchema.optional(),
  }),
})(async (req, ctx) => {
  const { name, description } = req.jsonBody

  const existingPackage = ctx.db.packages.find((pkg) => pkg.name === name)

  if (existingPackage) {
    throw ctx.error(400, {
      error_code: "package_already_exists",
      message: "A package with this name already exists",
    })
  }

  const newPackage = ctx.db.addPackage({
    name,
    description: description ?? null,
    creator_account_id: ctx.auth.account_id,
    owner_org_id: ctx.auth.personal_org_id,
    owner_github_username: ctx.auth.github_username,
    latest_package_release_id: null,
    latest_version: null,
    license: null,
    is_source_from_github: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unscoped_name: name,
    star_count: 0,
    ai_description: name,
  })

  if (!newPackage) {
    throw new Error("Failed to create package")
  }

  return ctx.json({
    package: publicMapPackage(newPackage),
  })
})
