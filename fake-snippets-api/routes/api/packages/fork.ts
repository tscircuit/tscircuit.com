import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackage } from "fake-snippets-api/lib/public-mapping/public-map-package"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z
    .object({
      // Accept either package_id or package_name to find the package to fork
      package_id: z.string().optional(),
      package_name: z.string().optional(),
      // Optional parameters to customize the forked package
      is_private: z.boolean().optional().default(false),
      is_unlisted: z.boolean().optional().default(false),
    })
    .refine(
      (data) =>
        data.package_id !== undefined || data.package_name !== undefined,
      {
        message: "Either package_id or package_name must be provided",
      },
    )
    .transform((data) => ({
      ...data,
      // If the package is private, it should be unlisted
      is_unlisted: data.is_private ? true : data.is_unlisted,
    })),
  jsonResponse: z.object({
    package: packageSchema,
  }),
})(async (req, ctx) => {
  const { package_id, package_name, is_private, is_unlisted } = req.jsonBody

  // Find the package to fork
  let sourcePackage = null
  if (package_id) {
    sourcePackage = ctx.db.packages.find((pkg) => pkg.package_id === package_id)
  } else if (package_name) {
    sourcePackage = ctx.db.packages.find((pkg) => pkg.name === package_name)
  }

  if (!sourcePackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "The package to fork was not found",
    })
  }

  // Check if user can read the source package
  const permissions = ctx.db.getPackagePermissions(
    sourcePackage.package_id,
    ctx.auth,
  )
  if (sourcePackage.is_private && !permissions.can_read_package) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "The package to fork was not found",
    })
  }

  if (sourcePackage.creator_account_id === ctx.auth.account_id) {
    return ctx.error(400, {
      error_code: "cannot_fork_own_package",
      message: "You cannot fork your own package",
    })
  }

  // Check if fork already exists (user already has a package with the same name)
  const forkName = `${ctx.auth.github_username}/${sourcePackage.unscoped_name}`
  const existingFork = ctx.db.packages.find(
    (pkg) =>
      pkg.creator_account_id === ctx.auth.account_id && pkg.name === forkName,
  )

  if (existingFork) {
    return ctx.json({
      package: publicMapPackage(existingFork),
    })
  }

  // Find the latest release of the source package
  const sourcePackageRelease = ctx.db.packageReleases.find(
    (release) =>
      release.package_id === sourcePackage.package_id &&
      release.is_latest === true,
  )

  if (!sourcePackageRelease) {
    return ctx.error(404, {
      error_code: "source_package_release_not_found",
      message: "The source package does not have any releases to fork",
    })
  }

  // Get the files from the source package release
  const sourceFiles = ctx.db.packageFiles.filter(
    (file) =>
      file.package_release_id === sourcePackageRelease.package_release_id,
  )

  if (sourceFiles.length === 0) {
    return ctx.error(404, {
      error_code: "source_package_files_not_found",
      message: "The source package release does not have any files to fork",
    })
  }

  // Create the forked package
  const forkedPackage = ctx.db.addPackage({
    name: forkName,
    description: sourcePackage.description,
    creator_account_id: ctx.auth.account_id,
    owner_org_id: ctx.auth.personal_org_id,
    owner_github_username: ctx.auth.github_username,
    latest_package_release_id: null,
    latest_version: null,
    license: null,
    website: null,
    is_source_from_github: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unscoped_name: sourcePackage.unscoped_name,
    star_count: 0,
    ai_description: sourcePackage.ai_description || "forked package",
    is_private: is_private,
    is_public: !is_private,
    is_unlisted,
    ai_usage_instructions: "forked package usage",
    is_board: Boolean(sourcePackage.is_board),
    is_package: true,
    is_model: Boolean(sourcePackage.is_model),
    is_footprint: Boolean(sourcePackage.is_footprint),
    is_snippet: Boolean(sourcePackage.is_snippet),
  })

  if (!forkedPackage) {
    return ctx.error(500, {
      error_code: "failed_to_create_forked_package",
      message: "Failed to create forked package",
    })
  }

  // Create a new package release for the forked package
  const forkedPackageRelease = ctx.db.addPackageRelease({
    package_id: forkedPackage.package_id,
    version: sourcePackageRelease.version,
    is_locked: false,
    is_latest: true,
    created_at: new Date().toISOString(),
    commit_sha: null,
    license: sourcePackageRelease.license || null,
    // Setting the transpiled as true on creation
    has_transpiled: true,
    transpilation_error: null,
  })

  // Update the forked package with release info
  forkedPackage.latest_package_release_id =
    forkedPackageRelease.package_release_id
  forkedPackage.latest_version = forkedPackageRelease.version || null

  // Copy all files from the source package release to the forked package release
  for (const sourceFile of sourceFiles) {
    ctx.db.addPackageFile({
      package_release_id: forkedPackageRelease.package_release_id,
      file_path: sourceFile.file_path,
      content_text: sourceFile.content_text,
      created_at: new Date().toISOString(),
    })
  }

  return ctx.json({
    package: publicMapPackage(forkedPackage),
  })
})
