import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { destinationCountryCode } from "fake-snippets-api/lib/destination-country-code"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST", "PATCH"],
  auth: "session",
  jsonBody: z
    .object({ destination_country_code: destinationCountryCode.nullable() })
    .strict(),
  jsonResponse: z.object({
    quote_preferences: z.object({
      destination_country_code: destinationCountryCode.nullable(),
    }),
  }),
})(async (req, ctx) => {
  const account = ctx.db.getAccount(ctx.auth.account_id)
  if (!account)
    return ctx.error(404, {
      error_code: "account_not_found",
      message: "Account not found",
    })
  ctx.db.updateAccount(ctx.auth.account_id, {
    quote_destination_country_code: req.jsonBody.destination_country_code,
  })
  return ctx.json({
    quote_preferences: {
      destination_country_code: req.jsonBody.destination_country_code,
    },
  })
})
