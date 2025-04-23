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

  // Handle updates
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

  if (is_latest !== undefined) {
    if (is_latest === true) {
      // Setting this release to latest

      // 1. Update all other releases for this package to is_latest: false
      const otherReleasesToUpdate = ctx.db.packageReleases.filter(
        (pr) =>
          pr.package_id === targetRelease.package_id &&
          pr.package_release_id !== releaseId &&
          pr.is_latest === true, // Only update those that are currently latest
      )

      for (const pr of otherReleasesToUpdate) {
        // Only update if it's actually changing
        if (pr.is_latest) {
          ctx.db.updatePackageRelease({ ...pr, is_latest: false })
        }
      }

      // 2. Update the target release
      const updatedTargetRelease = {
        ...targetRelease,
        is_latest: true,
        ...(is_locked !== undefined && { is_locked }),
        ...(license !== undefined && { license }),
      }
      // Only update if there's an actual change
      if (
        updatedTargetRelease.is_latest !== targetRelease.is_latest ||
        updatedTargetRelease.is_locked !== targetRelease.is_locked ||
        updatedTargetRelease.license !== targetRelease.license
      ) {
        ctx.db.updatePackageRelease(updatedTargetRelease)
      }
    } else {
      // Setting this release to NOT latest
      const updatedRelease = {
        ...targetRelease,
        is_latest: false,
        ...(is_locked !== undefined && { is_locked }),
        ...(license !== undefined && { license }),
      }
      // Only update if there's an actual change
      if (
        updatedRelease.is_latest !== targetRelease.is_latest ||
        updatedRelease.is_locked !== targetRelease.is_locked ||
        updatedRelease.license !== targetRelease.license
      ) {
        ctx.db.updatePackageRelease(updatedRelease)
      }
    }
  } else {
    // is_latest not specified, just update other fields
    const updatedRelease = {
      ...targetRelease,
      ...(is_locked !== undefined && { is_locked }),
      ...(license !== undefined && { license }),
    }
    // Only update if there are actual changes
    if (
      updatedRelease.is_locked !== targetRelease.is_locked ||
      updatedRelease.license !== targetRelease.license
    ) {
      ctx.db.updatePackageRelease(updatedRelease)
    }
  }

  return ctx.json({
    ok: true,
  })
})
