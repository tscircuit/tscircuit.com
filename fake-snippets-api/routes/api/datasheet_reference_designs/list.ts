import { z } from "zod"
import {
  referenceDesignManifestSchema,
  publishedReferenceDesignSchema,
  REFERENCE_DESIGN_MANIFEST_PATH,
  type PublishedReferenceDesign,
} from "@tscircuit/runframe/reference-designs"
import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"

const normalizeChipName = (chipName: string) =>
  chipName.replace(/[^a-z0-9_-]/gi, "").toLowerCase()

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({
    chip_name: z.string().min(1),
    package_release_id: z.string().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
  jsonResponse: z.object({
    reference_designs: z.array(publishedReferenceDesignSchema),
    pagination: z.object({ next_cursor: z.string().nullable() }),
  }),
})(async (req, ctx) => {
  const reference_designs: PublishedReferenceDesign[] = []
  const chipName = normalizeChipName(req.commonParams.chip_name)
  for (const pkg of ctx.db.packages) {
    if (pkg.is_private || pkg.is_unlisted) continue
    const releases = ctx.db.packageReleases
      .filter((release) => release.package_id === pkg.package_id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    const release = req.commonParams.package_release_id
      ? releases.find(
          (release) =>
            release.package_release_id === req.commonParams.package_release_id,
        )
      : releases[0]
    if (!release) continue
    const files = ctx.db.packageFiles.filter(
      (file) => file.package_release_id === release.package_release_id,
    )
    const manifestFile = files.find(
      (file) => file.file_path === REFERENCE_DESIGN_MANIFEST_PATH,
    )
    if (!manifestFile?.content_text) continue
    let manifest: unknown
    try {
      manifest = JSON.parse(manifestFile.content_text)
    } catch {
      continue
    }
    const parsed = referenceDesignManifestSchema.safeParse(manifest)
    if (!parsed.success) continue
    for (const reference_design of parsed.data.reference_designs) {
      if (
        !reference_design.chip_names.some(
          (chip) => normalizeChipName(chip) === chipName,
        )
      )
        continue
      const artifactPaths = new Set(
        reference_design.configurations.flatMap((configuration) => [
          configuration.circuit_json_path,
          configuration.glb_path,
          configuration.pcb_svg_path,
          configuration.schematic_svg_path,
        ]),
      )
      const artifacts = files.filter((file) =>
        artifactPaths.has(file.file_path),
      )
      if (artifacts.length !== artifactPaths.size) continue
      reference_designs.push({
        package_id: pkg.package_id,
        package_release_id: release.package_release_id,
        package_name: pkg.name,
        reference_design,
        files: artifacts.map(({ file_path, package_file_id }) => ({
          file_path,
          package_file_id,
        })),
      })
    }
  }
  const packageIds = [
    ...new Set(reference_designs.map((design) => design.package_id)),
  ]
    .sort()
    .filter((id) => !req.commonParams.cursor || id > req.commonParams.cursor)
  const page = packageIds.slice(0, req.commonParams.limit)
  return ctx.json({
    reference_designs: reference_designs.filter((design) =>
      page.includes(design.package_id),
    ),
    pagination: {
      next_cursor: packageIds.length > page.length ? page.at(-1)! : null,
    },
  })
})
