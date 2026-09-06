import { packageSchema, type Package } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

const CACHE_DURATION_SECONDS = 48 * 60 * 60

const relatedTypeSchema = z.enum([
  "same_author",
  "similar_ai_description",
  "random",
])

const getThumbnailUrl = (pkg: Package) =>
  pkg.latest_pcb_preview_image_url ??
  pkg.latest_sch_preview_image_url ??
  pkg.latest_cad_preview_image_url ??
  null

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  commonParams: z.object({ package_id: z.string() }),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(
      packageSchema.extend({
        related_type: relatedTypeSchema,
        thumbnail_url: z.string(),
      }),
    ),
  }),
})(async (req, ctx) => {
  const sourcePackage = ctx.db.getPackageById(req.commonParams.package_id)

  if (!sourcePackage) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }

  const eligiblePackages = ctx.db.packages.filter(
    (pkg) =>
      pkg.package_id !== sourcePackage.package_id &&
      pkg.is_public !== false &&
      !pkg.is_private &&
      !pkg.is_unlisted &&
      Boolean(getThumbnailUrl(pkg)),
  )
  const selectedPackageIds = new Set<string>()
  const packages: Array<
    Package & {
      related_type: z.infer<typeof relatedTypeSchema>
      thumbnail_url: string
    }
  > = []

  const addPackage = (
    pkg: Package | undefined,
    relatedType: z.infer<typeof relatedTypeSchema>,
  ) => {
    if (!pkg || selectedPackageIds.has(pkg.package_id)) return
    const thumbnailUrl = getThumbnailUrl(pkg)
    if (!thumbnailUrl) return
    selectedPackageIds.add(pkg.package_id)
    packages.push({
      ...pkg,
      related_type: relatedType,
      thumbnail_url: thumbnailUrl,
    })
  }

  addPackage(
    eligiblePackages.find(
      (pkg) => pkg.owner_org_id === sourcePackage.owner_org_id,
    ),
    "same_author",
  )
  addPackage(
    eligiblePackages.find(
      (pkg) =>
        pkg.owner_org_id !== sourcePackage.owner_org_id &&
        !selectedPackageIds.has(pkg.package_id),
    ),
    "similar_ai_description",
  )
  addPackage(
    eligiblePackages.find(
      (pkg) =>
        pkg.owner_org_id !== sourcePackage.owner_org_id &&
        !selectedPackageIds.has(pkg.package_id),
    ),
    "random",
  )

  return ctx.json({ ok: true, packages }).headers({
    "Cache-Control": `public, max-age=${CACHE_DURATION_SECONDS}, s-maxage=${CACHE_DURATION_SECONDS}`,
  })
})
