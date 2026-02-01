import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDeploymentSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDeployment } from "fake-snippets-api/lib/public-mapping/public-map-package-deployment"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_deployment_id: z.string(),
    default_main_component_path: z.string().nullable().optional(),
    fully_qualified_domain_name: z.string().nullable().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_deployment: publicPackageDeploymentSchema,
  }),
})(async (req, ctx) => {
  const {
    package_deployment_id,
    default_main_component_path,
    fully_qualified_domain_name,
  } = req.jsonBody

  const existingDeployment = ctx.db.getPackageDeploymentById(
    package_deployment_id,
  )

  if (!existingDeployment) {
    return ctx.error(404, {
      error_code: "package_deployment_not_found",
      message: "Package deployment not found",
    })
  }

  if (
    fully_qualified_domain_name !== undefined &&
    fully_qualified_domain_name !== null
  ) {
    const conflictingDeployment = ctx.db.packageDeployments.find(
      (pd) =>
        pd.fully_qualified_domain_name === fully_qualified_domain_name &&
        pd.package_deployment_id !== package_deployment_id,
    )

    if (conflictingDeployment) {
      return ctx.error(400, {
        error_code: "deployment_fqdn_exists",
        message:
          "A deployment with this fully qualified domain name already exists",
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
      package_deployment: publicMapPackageDeployment(existingDeployment),
    })
  }

  const updatedDeployment = ctx.db.updatePackageDeployment(
    package_deployment_id,
    updateValues,
  )

  if (!updatedDeployment) {
    return ctx.error(500, {
      error_code: "update_failed",
      message: "Failed to update package deployment",
    })
  }

  return ctx.json({
    ok: true,
    package_deployment: publicMapPackageDeployment(updatedDeployment),
  })
})
