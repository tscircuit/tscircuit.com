import { loadCircuitJsonTo3dPng } from "@/lib/utils/load-internal-dynamic-modules"
import { renderAsync } from "@resvg/resvg-js"
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

// 3D renders are only available as PNG; the other views support SVG and PNG.
const viewFormatPattern = new RegExp(
  "^(?:(schematic|pcb|assembly)-?(\\d+w)?\\.(svg|png)|3d-?(\\d+w)?\\.png)$",
)

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  routeParams: z.object({
    owner_github_username: z.string(),
    unscoped_name: z.string(),
    view_format: z.string().regex(viewFormatPattern, {
      message: `Invalid view format. ${VIEW_TYPES.slice(0, -1).join(", ")} support SVG or PNG; 3d supports PNG only. All views accept an optional width suffix (e.g. -800w).`,
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
  const [, outputType, width, format] = view_format.match(
    /^(.+?)(?:-(\d+)w)?\.(.+)$/,
  )!
  const requestedWidth = Number(width)

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

  if (outputType === "3d") {
    const { renderCircuitJsonTo3dPng } = await loadCircuitJsonTo3dPng()
    const png = await renderCircuitJsonTo3dPng(circuit_json, {
      ...(requestedWidth ? { width: requestedWidth, height: requestedWidth } : {}),
      backgroundColor: "#ffffff",
    })
    const pngBuffer = new ArrayBuffer(png.byteLength)
    new Uint8Array(pngBuffer).set(png)

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  }

  // Non-3D views are rendered to SVG, then optionally rasterized to PNG.
  let svg = ""
  if (outputType === "schematic") {
    svg = convertCircuitJsonToSchematicSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "pcb") {
    svg = convertCircuitJsonToPcbSvg(circuit_json as AnyCircuitElement[])
  } else if (outputType === "assembly") {
    svg = convertCircuitJsonToAssemblySvg(circuit_json as AnyCircuitElement[])
  }
  if (format === "svg") {
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  }

  const pngBuffer = await renderAsync(svg)
  return new Response(pngBuffer.asPng().buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
})
