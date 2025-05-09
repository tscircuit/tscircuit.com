import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import { snippetSchema } from "fake-snippets-api/lib/db/schema"
import { fetchEasyEDAComponent, convertRawEasyEdaToTs } from "easyeda"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    jlcpcb_part_number: z.string(),
  }),
  jsonResponse: z.object({
    snippet: snippetSchema,
  }),
})(async (req, ctx) => {
  const { jlcpcb_part_number } = req.jsonBody

  try {
    // Fetch the EasyEDA component data
    const rawEasyJson = await fetchEasyEDAComponent(jlcpcb_part_number)

    // Convert to TypeScript React component
    const tsxComponent = await convertRawEasyEdaToTs(rawEasyJson)

    // Create a new snippet
    const newSnippet = {
      name: `${ctx.auth.github_username}/${jlcpcb_part_number}`,
      unscoped_name: jlcpcb_part_number,
      owner_name: ctx.auth.github_username,
      code: tsxComponent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      snippet_type: "package",
      description: `Generated from JLCPCB part number ${jlcpcb_part_number}`,
    }

    const createdPackage = ctx.db.addSnippet(newSnippet as any)

    return ctx.json({
      snippet: createdPackage as any,
    })
  } catch (error: any) {
    return ctx.error(500, {
      error_code: "jlcpcb_generation_failed",
      message: `Failed to generate package from JLCPCB part: ${error.message}`,
    })
  }
})
