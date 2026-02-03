import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDomainSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDomain } from "fake-snippets-api/lib/public-mapping/public-map-package-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_domain_id: z.string(),
    default_main_component_path: z.string().nullable().optional(),
    fully_qualified_domain_name: z.string().nullable().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_domain: publicPackageDomainSchema,
  }),
})(async (req, ctx) => {
  const {
    package_domain_id,
    default_main_component_path,
    fully_qualified_domain_name,
  } = req.jsonBody

  const existingDomain = ctx.db.getPackageDomainById(package_domain_id)

  if (!existingDomain) {
    return ctx.error(404, {
      error_code: "package_domain_not_found",
      message: "Package domain not found",
    })
  }

  if (
    fully_qualified_domain_name !== undefined &&
    fully_qualified_domain_name !== null
  ) {
    const conflictingDomain = ctx.db.packageDomains.find(
      (pd) =>
        pd.fully_qualified_domain_name === fully_qualified_domain_name &&
        pd.package_domain_id !== package_domain_id,
    )

    if (conflictingDomain) {
      return ctx.error(400, {
        error_code: "domain_fqdn_exists",
        message:
          "A domain with this fully qualified domain name already exists",
      })
    }
  }

  const updateValues: Record<string, unknown> = {}

  if (default_main_component_path !== undefined) {
    updateValues.default_main_component_path = default_main_component_path
  }

  if (fully_qualified_domain_name !== undefined) {
    updateValues.fully_qualified_domain_name = fully_qualified_domain_name
  }

  if (Object.keys(updateValues).length === 0) {
    return ctx.json({
      ok: true,
      package_domain: publicMapPackageDomain(existingDomain),
    })
  }

  const updatedDomain = ctx.db.updatePackageDomain(
    package_domain_id,
    updateValues,
  )

  if (!updatedDomain) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update package domain",
    })
  }

  return ctx.json({
    ok: true,
    package_domain: publicMapPackageDomain(updatedDomain),
  })
})
