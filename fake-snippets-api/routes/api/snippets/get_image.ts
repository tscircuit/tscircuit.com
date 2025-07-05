import { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  queryParams: z.object({
    snippetId: z.string(),
    image_of: z.enum(["schematic", "pcb"]),
    format: z.enum(["svg"]),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    svg: z.string(),
  }),
})(async (req, ctx) => {
  const { snippetId, image_of, format } = req.query

  const snippet = ctx.db.getSnippetById(snippetId)

  // check if the snippet exists
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  // Check if the format is valid
  if (format !== "svg") {
    return ctx.error(400, {
      error_code: "invalid_format",
      message: "Format must be 'svg'",
    })
  }

  if (image_of === "schematic") {
    const circuitJson = snippet.circuit_json as AnyCircuitElement[]
    const svg = convertCircuitJsonToSchematicSvg(circuitJson)
    return ctx.json({
      ok: true,
      svg,
    })
  }

  if (image_of === "pcb") {
    const svg = convertCircuitJsonToPcbSvg(
      snippet.circuit_json as AnyCircuitElement[],
    )
    return ctx.json({
      ok: true,
      svg,
    })
  }

  return ctx.error(400, {
    error_code: "INVALID_REQUEST_TYPE",
    message: "Request type must be either 'schematic' or 'pcb'",
  })
})
