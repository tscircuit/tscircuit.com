import { publicPackageDomainSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicMapPackageDomain } from "fake-snippets-api/lib/public-mapping/public-map-package-domain"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_domain_id: z.string(),
    default_main_component_path: z.string().nullable().optional(),
    fully_qualified_domain_name: z.string().nullable().optional(),
    points_to: z
      .enum([
        "package_release",
        "package_build",
        "package_release_with_tag",
        "package",
      ])
      .optional(),
    package_release_id: z.string().optional(),
    package_build_id: z.string().optional(),
    package_id: z.string().optional(),
    tag: z.string().optional(),
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
    points_to,
    package_release_id,
    package_build_id,
    package_id,
    tag,
  } = req.jsonBody

  const existingDomain = ctx.db.getPackageDomainById(package_domain_id)

  if (!existingDomain) {
    return ctx.error(404, {
      error_code: "package_domain_not_found",
      message: "Package domain not found",
    })
  }

  // Check FQDN uniqueness if being updated
  if (
    fully_qualified_domain_name !== undefined &&
    fully_qualified_domain_name !== null
  ) {
    const conflicting = ctx.db.packageDomains.find(
      (pd) =>
        pd.fully_qualified_domain_name === fully_qualified_domain_name &&
        pd.package_domain_id !== package_domain_id,
    )

    if (conflicting) {
      return ctx.error(400, {
        error_code: "domain_fqdn_exists",
        message:
          "A domain with this fully qualified domain name already exists",
      })
    }
  }

  // Validate the points_to constraint if points_to is being updated
  if (points_to !== undefined) {
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
  }

  const updateValues: Record<string, unknown> = {}

  if (default_main_component_path !== undefined) {
    updateValues.default_main_component_path = default_main_component_path
  }

  if (fully_qualified_domain_name !== undefined) {
    updateValues.fully_qualified_domain_name = fully_qualified_domain_name
  }

  if (points_to !== undefined) {
    updateValues.points_to = points_to
    // Clear all pointer fields and set the appropriate ones
    updateValues.package_release_id = package_release_id ?? null
    updateValues.package_build_id = package_build_id ?? null
    updateValues.package_id = package_id ?? null
    updateValues.tag = tag ?? null
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
