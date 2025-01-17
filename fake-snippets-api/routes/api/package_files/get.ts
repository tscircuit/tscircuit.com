import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import { z } from "zod"
import * as ZT from "fake-snippets-api/lib/db/schema"
import { NotFoundError } from "winterspec/middleware"

const routeSpec = {
  methods: ["POST"],
  auth: "none",
  jsonBody: z
    .object({
      package_file_id: z.string().uuid(),
    })
    .or(
      z.object({
        package_release_id: z.string().uuid(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_id: z.string().uuid(),
        version: z.string().optional(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_name: z.string(),
        version: z.string().optional(),
        file_path: z.string(),
      }),
    )
    .or(
      z.object({
        package_name_with_version: z.string(),
        file_path: z.string(),
      }),
    ),
  jsonResponse: z
    .object({
      ok: z.boolean(),
      package_file: ZT.public_package_file.optional(),
    })
    .or(ZT.error_response),
} as const

export default withRouteSpec(routeSpec)(async (req, ctx) => {
  return ctx.json({
    // TODO
  })
})
