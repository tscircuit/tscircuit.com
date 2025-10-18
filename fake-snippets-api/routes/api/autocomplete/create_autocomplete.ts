import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    prefix: z.string(),
    suffix: z.string(),
  }),
  jsonResponse: z.object({
    prediction: z.string(),
  }),
})(async (req, ctx) => {
  return ctx.json({ prediction: "{/* mock autocomplete prediction */}" })
})
