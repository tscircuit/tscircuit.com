import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import Debug from "debug"

const debug = Debug("fake-snippets-api:rebuild-package")

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string(),
    rebuild_transpilation: z.boolean().default(true),
    rebuild_circuit_json: z.boolean().default(true),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
  }),
})(async (req, ctx) => {
  const { package_release_id, rebuild_transpilation, rebuild_circuit_json } =
    req.jsonBody

  // Get the package release info for logging
  const release = ctx.db.getPackageReleaseById(package_release_id)

  if (!release) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  const packageInfo = ctx.db.getPackageById(release.package_id)

  if (!packageInfo) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  if (packageInfo.owner_org_id !== ctx.auth.personal_org_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You do not have permission to rebuild this package release",
    })
  }

  debug(
    `Rebuilding package release ${package_release_id} for ${packageInfo.name}@${release.version}`,
  )

  // Trigger transpilation if requested
  if (rebuild_transpilation) {
    debug("Resetting transpilation state")
  }

  // Set circuit JSON build state to pending for worker pickup if requested
  if (rebuild_circuit_json) {
    debug("Resetting circuit JSON build state")
  }

  return ctx.json({
    ok: true,
  })
})
