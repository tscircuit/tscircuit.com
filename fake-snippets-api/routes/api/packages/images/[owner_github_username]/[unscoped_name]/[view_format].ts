import { AnyCircuitElement } from "circuit-json"
import {
  convertCircuitJsonToAssemblySvg,
  convertCircuitJsonToPcbSvg,
  convertCircuitJsonToSchematicSvg,
} from "circuit-to-svg"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

// Define the view types and extensions
const VIEW_TYPES = ["schematic", "pcb", "assembly", "3d"] as const
const EXTENSIONS = ["svg", "png"] as const

// Create a regex pattern for the view format that includes optional width suffix
const viewFormatPattern = new RegExp(
  `^(${VIEW_TYPES.join("|")})-?(\\d+w)?\\.(${EXTENSIONS.join("|")})$`,
)

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  routeParams: z.object({
    owner_github_username: z.string(),
    unscoped_name: z.string(),
    view_format: z.string().regex(viewFormatPattern, {
      message: `Invalid view format. Must be one of: ${VIEW_TYPES.join(", ")} with optional width suffix (e.g. -800w).${EXTENSIONS.join(" or ")}`,
    }),
  }),
  queryParams: z.object({
    fs_sha: z.string().optional(),
  }),
  rawResponse: true,
})(async (req, ctx) => {
  const { owner_github_username, unscoped_name, view_format } = req.routeParams
  const { fs_sha } = req.query

  // Parse the view format
  const [outputType, format] = view_format.split(".")

  // Get the package by owner handle and unscoped name
  const ownerOrg = ctx.db.organizations.find(
    (o) =>
      o.tscircuit_handle?.toLowerCase() === owner_github_username.toLowerCase(),
  )
  const pkg = ctx.db.packages.find(
    (p) =>
      p.owner_org_id === ownerOrg?.org_id && p.unscoped_name === unscoped_name,
  )

  // If package is not found, return 404
  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  // Get the package release for the given hash value
  const pkg_release = ctx.db.packageReleases.find(
    (pr) => pr.package_id === pkg.package_id && pr.fs_sha === fs_sha,
  )

  if (!pkg_release) {
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Package release not found",
    })
  }

  // Get the circuit JSON from the package files
  const circuit_json_file = ctx.db.packageFiles.find(
    (pf) =>
      pf.package_release_id === pkg_release.package_release_id &&
      (pf.file_path === "circuit.json" ||
        pf.file_path === "/dist/circuit.json"),
  )

  if (!circuit_json_file?.content_text) {
    return ctx.error(404, {
      error_code: "circuit_json_not_found",
      message: "Circuit JSON not found for package",
    })
  }

  const circuit_json = JSON.parse(circuit_json_file.content_text)

  const requestCircuitImage = async (type: string, outputFormat: string) => {
    const svgServerUrl = process.env.SVG_SERVER_URL || "https://svg.tscircuit.com"
    const imageResponse = await fetch(
      `${svgServerUrl}?svg_type=${type}&format=${outputFormat}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ circuit_json }),
      },
    )

    if (!imageResponse.ok) {
      return ctx.error(502, {
        error_code: "image_service_error",
        message: `${type} image service returned ${imageResponse.status}`,
      })
    }

    const body =
      outputFormat === "svg"
        ? await imageResponse.text()
        : await imageResponse.arrayBuffer()
    const contentType = outputFormat === "svg" ? "image/svg+xml" : "image/png"

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  }

  // Convert circuit json to svg
  let svg = ""
  if (outputType === "schematic") {
    svg = convertCircuitJsonToSchematicSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "pcb") {
    svg = convertCircuitJsonToPcbSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "assembly") {
    svg = convertCircuitJsonToAssemblySvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "3d") {
    return requestCircuitImage("3d", format)
  }
  if (format === "png") {
    return requestCircuitImage(outputType, "png")
  }
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
})
