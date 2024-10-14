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
    const rawEasyJson = await fetchEasyEDAComponent(jlcpcb_part_number).catch(
      (e) => `Error in fetchEasyEDAComponent: ${e.toString()}`,
    )

    // Convert to TypeScript React component
    const tsxComponent = await convertRawEasyEdaToTs(rawEasyJson).catch(
      (e) => `Error in convertRawEasyEdaToTs ${e.toString()}`,
    )

    // Create a new snippet
    const newSnippet = {
      snippet_id: `snippet_${ctx.db.idCounter + 1}`,
      name: `${ctx.auth.github_username}/${jlcpcb_part_number}`,
      unscoped_name: jlcpcb_part_number,
      owner_name: ctx.auth.github_username,
      code: tsxComponent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      snippet_type: "package",
      description: `Generated from JLCPCB part number ${jlcpcb_part_number}`,
    }

    ctx.db.addSnippet(newSnippet as any)

    return ctx.json({
      snippet: newSnippet as any,
    })
  } catch (error: any) {
    return ctx.error(500, {
      error_code: "jlcpcb_generation_failed",
      message: `Failed to generate snippet from JLCPCB part: ${error.message}\n\n${error.stack}`,
    })
  }
})
