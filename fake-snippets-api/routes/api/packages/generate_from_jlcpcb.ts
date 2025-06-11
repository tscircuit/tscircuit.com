import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { packageSchema } from "fake-snippets-api/lib/db/schema"
import {
  fetchEasyEDAComponent,
  convertRawEasyEdaToTs,
  normalizeManufacturerPartNumber,
  EasyEdaJsonSchema,
} from "easyeda"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    jlcpcb_part_number: z.string().min(1, "JLCPCB part number is required"),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    package: packageSchema,
  }),
})(async (req, ctx) => {
  const { jlcpcb_part_number } = req.jsonBody

  try {
    const rawEasyJson = await fetchEasyEDAComponent(jlcpcb_part_number)

    if (!rawEasyJson) {
      return ctx.error(404, {
        error_code: "component_not_found",
        message: `Component with JLCPCB part number ${jlcpcb_part_number} not found`,
      })
    }

    const betterEasy = await EasyEdaJsonSchema.parse(rawEasyJson)

    const tsxComponent = await convertRawEasyEdaToTs(rawEasyJson)

    const componentName = normalizeManufacturerPartNumber(
      betterEasy.dataStr.head.c_para["Manufacturer Part"] ?? "",
    )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/--/g, "-")

    const packageName = `${ctx.auth.github_username}/${componentName}`

    const existingPackage = ctx.db.packages.find((p) => p.name === packageName)

    if (existingPackage) {
      return ctx.error(409, {
        error_code: "package_already_exists",
        message: componentName,
      })
    }

    const newPackage = {
      name: packageName,
      unscoped_name: componentName,
      owner_name: ctx.auth.github_username,
      code: tsxComponent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: `Generated from JLCPCB part number ${jlcpcb_part_number}`,
      creator_account_id: ctx.auth.account_id,
      owner_org_id: ctx.auth.personal_org_id,
      owner_github_username: ctx.auth.github_username,
      latest_package_release_id: null,
      latest_package_release_fs_sha: null,
      latest_version: null,
      license: null,
      ai_description: "placeholder ai description",
      ai_usage_instructions: "placeholder ai usage instructions",
    }

    const createdPackage = ctx.db.addPackage(newPackage)

    const createdPackageRelease = ctx.db.addPackageRelease({
      package_id: createdPackage.package_id,
      version: "1.0.0",
      created_at: new Date().toISOString(),
      is_latest: true,
      is_locked: false,
    })

    ctx.db.updatePackage(createdPackage.package_id, {
      latest_package_release_id: createdPackageRelease.package_release_id,
    })

    ctx.db.addPackageFile({
      package_release_id: createdPackageRelease.package_release_id,
      file_path: "index.tsx",
      content_text: String(tsxComponent),
      created_at: new Date().toISOString(),
    })

    return ctx.json({
      ok: true,
      package: createdPackage as any,
    })
  } catch (error: any) {
    if (String(error).includes("Component not found")) {
      return ctx.error(404, {
        error_code: "component_not_found",
        message: `Component with JLCPCB part number ${jlcpcb_part_number} not found`,
      })
    }
    return ctx.error(500, {
      error_code: "package_generation_failed",
      message: `Failed to generate package from JLCPCB part: ${error.message || String(error)}`,
    })
  }
})
