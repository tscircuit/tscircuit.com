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
  if (is_latest !== undefined) {
    if (is_latest === true) {
      // Setting this release to latest
      const allReleasesForPackage = ctx.db.packageReleases.filter(
        (pr) => pr.package_id === release.package_id,
      )

      for (const pr of allReleasesForPackage) {
        const isTargetRelease = pr.package_release_id === releaseId
        const needsUpdate = isTargetRelease || pr.is_latest

        if (needsUpdate) {
          const updateData = {
            ...pr,
            is_latest: isTargetRelease, // Set target to true, others potentially to false
          }

          // Apply other requested changes only to the target release
          if (isTargetRelease) {
            if (is_locked !== undefined) updateData.is_locked = is_locked
            if (license !== undefined) updateData.license = license
          }

          // Only update if there's a change in is_latest or other fields for the target
          if (
            updateData.is_latest !== pr.is_latest ||
            (isTargetRelease &&
              (updateData.is_locked !== pr.is_locked ||
                updateData.license !== pr.license))
          ) {
            ctx.db.updatePackageRelease(updateData)
          }
        }
      }
    } else {
      // Setting this release to NOT latest (or just updating other fields)
      const updatedRelease = {
        ...release,
        is_latest: false,
        ...(is_locked !== undefined && { is_locked }),
        ...(license !== undefined && { license }),
      }
      ctx.db.updatePackageRelease(updatedRelease)
    }
  } else {
    // is_latest not specified, just update other fields
    const updatedRelease = {
      ...release,
      ...(is_locked !== undefined && { is_locked }),
      ...(license !== undefined && { license }),
    }
    // Only update if there are actual changes
    if (
      updatedRelease.is_locked !== release.is_locked ||
      updatedRelease.license !== release.license
    ) {
      ctx.db.updatePackageRelease(updatedRelease)
    }
  }

  return ctx.json({
    ok: true,
  })
})
