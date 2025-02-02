import { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonToAssemblySvg,
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { convertCircuitJsonTo3dSvg } from "@tscircuit/3d-viewer"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  routeParams: z.object({
    author: z.string(),
    snippet_name: z.string(),
    typeFormat: z.string(),
  }),
  rawResponse: true,
})(async (req, ctx) => {
  const { author, snippet_name, typeFormat } = req.routeParams

  // Get the snippet
  const name = author + "/" + snippet_name
  const snippet = ctx.db.getSnippetByAuthorAndName(author, name)

  // If snippet is not found, return 404
  if (!snippet) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  // Check if the format is valid
  const format = typeFormat.split(".")[1]
  if (format !== "svg") {
    return ctx.error(400, {
      error_code: "invalid_format",
      message: "Format must be 'svg'",
    })
  }

  // Check if the type is valid
  const type = typeFormat.split(".")[0]
  const typesValid = ["schematic", "pcb", "assembly", "3d"]
  if (!typesValid.includes(type)) {
    return ctx.error(400, {
      error_code: "invalid_type",
      message: `Type must be '${typesValid.join("' or '")}'`,
    })
  }

  // Convert circuit json to svg
  let svg: string
  if (type === "schematic") {
    svg = convertCircuitJsonToSchematicSvg(
      snippet.circuit_json as AnyCircuitElement[],
    )
  } else if (type === "pcb") {
    svg = convertCircuitJsonToPcbSvg(
      snippet.circuit_json as AnyCircuitElement[],
    )
  } else if (type === "assembly") {
    svg = convertCircuitJsonToAssemblySvg(
      snippet.circuit_json as AnyCircuitElement[],
    )
  } else if (type === "3d") {
    svg = await convertCircuitJsonTo3dSvg(snippet.circuit_json as any, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      padding: 20,
      zoom: 9,
      viewAngle: "top" as const,
      camera: {
        position: {
          x: 0,
          y: 0,
          z: 100,
        },
        lookAt: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    })
  } else {
    return ctx.error(500, {
      error_code: "unknown_error",
      message: "Unknown error",
    })
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000",
    },
  })
})
