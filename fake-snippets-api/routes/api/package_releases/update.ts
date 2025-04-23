import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    package_release_id: z.string().optional(),
    package_name_with_version: z.string().optional(),
    is_locked: z.boolean().optional(),
    is_latest: z.boolean().optional(),
    license: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const {
    package_release_id,
    package_name_with_version,
    is_locked,
    is_latest,
    license,
  } = req.jsonBody
  let releaseId = package_release_id

  // Handle package_name_with_version lookup
  if (!releaseId && package_name_with_version) {
    const [packageName, version] = package_name_with_version.split("@")
    const pkg = ctx.db.packages.find((p) => p.name === packageName)
    if (pkg) {
      const release = ctx.db.packageReleases.find(
        (pr) => pr.package_id === pkg.package_id && pr.version === version,
      )
      if (release) {
        releaseId = release.package_release_id
      }
    }
  }

  if (!releaseId) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const delta = { is_locked, is_latest, license }
  if (
    Object.keys(delta).filter(
      (k) => delta[k as keyof typeof delta] !== undefined,
    ).length === 0
  ) {
    return ctx.error(400, {
      error_code: "no_fields_provided",
      message: "No fields provided to update",
    })
  }

  const release = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === releaseId,
  )
  if (!release) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Find the target release first
  const targetRelease = ctx.db.packageReleases.find(
    (pr) => pr.package_release_id === releaseId,
  )
  if (!targetRelease) {
    // This check is redundant as it's done above, but kept for safety
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Prepare the potential updates
  const updates: Partial<typeof targetRelease> = {}
  if (is_locked !== undefined) updates.is_locked = is_locked
  if (license !== undefined) updates.license = license
  // Tentatively add is_latest if provided
  if (is_latest !== undefined) updates.is_latest = is_latest

  // Handle the is_latest logic specifically
  if (is_latest === true) {
    // 1. Unset 'latest' from other releases of the same package
    const otherReleasesToUpdate = ctx.db.packageReleases.filter(
      (pr) =>
        pr.package_id === targetRelease.package_id &&
        pr.package_release_id !== releaseId &&
        pr.is_latest === true,
    )
    for (const pr of otherReleasesToUpdate) {
      // Update other releases unconditionally as they were filtered by is_latest === true
      ctx.db.updatePackageRelease({ ...pr, is_latest: false })
    }
    // 'updates.is_latest' is already set to true
  } else if (is_latest === false) {
    // 'updates.is_latest' is already set to false
    // No other releases need changing when setting one to false
  } else {
    // is_latest was not provided, remove it from potential updates
    delete updates.is_latest
  }

  // Check if there are any actual changes to apply to the target release
  const finalUpdateData = { ...targetRelease, ...updates }
  let needsUpdate = false
  for (const key in updates) {
    if (
      updates[key as keyof typeof updates] !==
      targetRelease[key as keyof typeof targetRelease]
    ) {
      needsUpdate = true
      break
    }
  }

  // Apply the update to the target release if needed
  if (needsUpdate) {
    ctx.db.updatePackageRelease(finalUpdateData)
  }

  return ctx.json({
    ok: true,
  })
})
