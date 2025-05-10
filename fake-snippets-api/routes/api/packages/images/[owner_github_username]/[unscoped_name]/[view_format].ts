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

// Create a regex pattern for the view format
const viewFormatPattern = new RegExp(
  `^(${VIEW_TYPES.join("|")})\\.(${EXTENSIONS.join("|")})$`,
)

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  routeParams: z.object({
    owner_github_username: z.string(),
    unscoped_name: z.string(),
    view_format: z.string().regex(viewFormatPattern, {
      message: `Invalid view format. Must be one of: ${VIEW_TYPES.join(", ")}.${EXTENSIONS.join(" or ")}`,
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

  // Get the package
  const pkg = ctx.db.packages.find(
    (p) =>
      p.owner_github_username === owner_github_username &&
      p.unscoped_name === unscoped_name,
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
      pf.file_path === "circuit.json",
  )

  if (!circuit_json_file?.content_text) {
    return ctx.error(404, {
      error_code: "circuit_json_not_found",
      message: "Circuit JSON not found for package",
    })
  }

  const circuit_json = JSON.parse(circuit_json_file.content_text)

  // Convert circuit json to svg
  let svg = ""

  if (outputType === "schematic") {
    svg = convertCircuitJsonToSchematicSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "pcb") {
    svg = convertCircuitJsonToPcbSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "assembly") {
    svg = convertCircuitJsonToAssemblySvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "3d") {
    // For 3D view, we'll return a simple SVG placeholder
    svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#666">3D Preview</text>
    </svg>`
  }

  if (format === "svg") {
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  }

  // For PNG format, we'll return the SVG as PNG
  // In a real implementation, this would use @resvg/resvg-js
  return new Response(svg, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
})
