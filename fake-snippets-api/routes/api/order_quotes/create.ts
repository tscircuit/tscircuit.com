import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_release_id: z.string(),
    vendor_name: z.literal("jlcpcb"),
  }),
  jsonResponse: z.object({
    order_quote_id: z.string().optional(),
    error: z
      .object({
        error_code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
})(async (req, ctx) => {
  const { package_release_id, vendor_name } = req.jsonBody

  // check package release exists
  const packageRelease = ctx.db.getPackageReleaseById(package_release_id)
  if (!packageRelease) {
    return ctx.json(
      {
        error: {
          error_code: "package_release_not_found",
          message: "Package release not found",
        },
      },
      { status: 404 },
    )
  }

  const packageReleaseFiles =
    ctx.db.getPackageFilesByReleaseId(package_release_id)
  if (packageReleaseFiles.length === 0) {
    return ctx.json(
      {
        error: {
          error_code: "package_release_files_not_found",
          message: "Package release files not found",
        },
      },
      { status: 404 },
    )
  }

  const orderQuoteId = ctx.db.addOrderQuote({
    account_id: ctx.auth.account_id,
    package_release_id,
    vendor_name,
  })

  return ctx.json({
    order_quote_id: orderQuoteId,
  })
})
