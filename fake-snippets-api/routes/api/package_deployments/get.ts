import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDeploymentSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDeployment } from "fake-snippets-api/lib/public-mapping/public-map-package-deployment"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    package_deployment_id: z.string().optional(),
    fully_qualified_domain_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_deployment: publicPackageDeploymentSchema,
  }),
})(async (req, ctx) => {
  const { package_deployment_id, fully_qualified_domain_name } =
    req.commonParams

  if (!package_deployment_id && !fully_qualified_domain_name) {
    return ctx.error(400, {
      error_code: "missing_parameter",
      message:
        "Either package_deployment_id or fully_qualified_domain_name must be provided",
    })
  }

  let packageDeployment

  if (package_deployment_id) {
    packageDeployment = ctx.db.getPackageDeploymentById(package_deployment_id)
  } else if (fully_qualified_domain_name) {
    packageDeployment = ctx.db.getPackageDeploymentByFQDN(
      fully_qualified_domain_name,
    )
  }

  if (!packageDeployment) {
    return ctx.error(404, {
      error_code: "package_deployment_not_found",
      message: "Package deployment not found",
    })
  }

  return ctx.json({
    ok: true,
    package_deployment: publicMapPackageDeployment(packageDeployment),
  })
})
