import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { publicPackageDeploymentSchema } from "fake-snippets-api/lib/db/schema"
import { publicMapPackageDeployment } from "fake-snippets-api/lib/public-mapping/public-map-package-deployment"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_build_id: z.string(),
    default_main_component_path: z.string().optional(),
    fully_qualified_domain_name: z.string().optional(),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package_deployment: publicPackageDeploymentSchema,
  }),
})(async (req, ctx) => {
  const {
    package_build_id,
    default_main_component_path,
    fully_qualified_domain_name,
  } = req.jsonBody

  const packageBuild = ctx.db.packageBuilds.find(
    (build) => build.package_build_id === package_build_id,
  )

  if (!packageBuild) {
    return ctx.error(404, {
      error_code: "package_build_not_found",
      message: "Package build not found",
    })
  }

  if (fully_qualified_domain_name) {
    const existingDeployment = ctx.db.packageDeployments.find(
      (pd) => pd.fully_qualified_domain_name === fully_qualified_domain_name,
    )

    if (existingDeployment) {
      return ctx.error(400, {
        error_code: "deployment_fqdn_exists",
        message:
          "A deployment with this fully qualified domain name already exists",
      })
    }
  }

  const packageDeployment = ctx.db.addPackageDeployment({
    package_release_id: packageBuild.package_release_id,
    package_build_id: package_build_id,
    default_main_component_path: default_main_component_path ?? null,
    fully_qualified_domain_name: fully_qualified_domain_name ?? null,
  })

  return ctx.json({
    ok: true,
    package_deployment: publicMapPackageDeployment(packageDeployment),
  })
})
