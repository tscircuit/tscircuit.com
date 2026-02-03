import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDomainSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDomain } from "fake-snippets-api/lib/public-mapping/public-map-package-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    points_to: z.enum([
      "package_release",
      "package_build",
      "package_release_with_tag",
      "package",
    ]),
    package_release_id: z.string().optional(),
    package_build_id: z.string().optional(),
    package_id: z.string().optional(),
    tag: z.string().optional(),
    default_main_component_path: z.string().optional(),
    fully_qualified_domain_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_domain: publicPackageDomainSchema,
  }),
})(async (req, ctx) => {
  const {
    points_to,
    package_release_id,
    package_build_id,
    package_id,
    tag,
    default_main_component_path,
    fully_qualified_domain_name,
  } = req.jsonBody

  if (points_to === "package_release") {
    if (!package_release_id) {
      return ctx.error(400, {
        error_code: "missing_package_release_id",
        message:
          "package_release_id is required when points_to is 'package_release'",
      })
    }
    if (package_build_id || tag || package_id) {
      return ctx.error(400, {
        error_code: "invalid_params",
        message:
          "package_build_id, tag, and package_id must not be provided when points_to is 'package_release'",
      })
    }
  } else if (points_to === "package_build") {
    if (!package_build_id) {
      return ctx.error(400, {
        error_code: "missing_package_build_id",
        message:
          "package_build_id is required when points_to is 'package_build'",
      })
    }
    if (package_release_id || tag || package_id) {
      return ctx.error(400, {
        error_code: "invalid_params",
        message:
          "package_release_id, tag, and package_id must not be provided when points_to is 'package_build'",
      })
    }
  } else if (points_to === "package_release_with_tag") {
    if (!package_release_id || !tag) {
      return ctx.error(400, {
        error_code: "missing_params",
        message:
          "package_release_id and tag are required when points_to is 'package_release_with_tag'",
      })
    }
    if (package_build_id || package_id) {
      return ctx.error(400, {
        error_code: "invalid_params",
        message:
          "package_build_id and package_id must not be provided when points_to is 'package_release_with_tag'",
      })
    }
  } else if (points_to === "package") {
    if (!package_id) {
      return ctx.error(400, {
        error_code: "missing_package_id",
        message: "package_id is required when points_to is 'package'",
      })
    }
    if (package_release_id || package_build_id || tag) {
      return ctx.error(400, {
        error_code: "invalid_params",
        message:
          "package_release_id, package_build_id, and tag must not be provided when points_to is 'package'",
      })
    }
  }

  if (fully_qualified_domain_name) {
    const existingDomain = ctx.db.packageDomains.find(
      (pd) => pd.fully_qualified_domain_name === fully_qualified_domain_name,
    )

    if (existingDomain) {
      return ctx.error(400, {
        error_code: "domain_fqdn_exists",
        message:
          "A domain with this fully qualified domain name already exists",
      })
    }
  }

  const packageDomain = ctx.db.addPackageDomain({
    points_to,
    package_release_id: package_release_id ?? null,
    package_build_id: package_build_id ?? null,
    package_id: package_id ?? null,
    tag: tag ?? null,
    default_main_component_path: default_main_component_path ?? null,
    fully_qualified_domain_name: fully_qualified_domain_name ?? null,
  })

  return ctx.json({
    ok: true,
    package_domain: publicMapPackageDomain(packageDomain),
  })
})
