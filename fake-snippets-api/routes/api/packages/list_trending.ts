import { packageSchema } from "fake-snippets-api/lib/db/schema"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "none",
  commonParams: z.object({}),
  jsonResponse: z.object({
    ok: z.boolean(),
    packages: z.array(packageSchema),
  }),
})(async (req, ctx) => {
  // Get all packages and their star counts
  const packagesWithStars = ctx.db.packages.map((pkg) => {
    const starCount = ctx.db.accountPackages.filter(
      (ap) => ap.package_id === pkg.package_id && ap.is_starred,
    ).length

    return {
      ...pkg,
      star_count: starCount,
    }
  })

  // Filter out packages with no stars and sort by star count
  const trendingPackages = packagesWithStars
    .filter((p) => p.star_count > 0)
    .sort((a, b) => b.star_count - a.star_count)
    .slice(0, 50)

  // Randomize the order of the packages, then pick the first 10
  const randomizedPackages = trendingPackages.sort(() => Math.random() - 0.5)
  const selectedPackages = randomizedPackages.slice(0, 10)

  return ctx.json({
    ok: true,
    packages: selectedPackages.map((p) => ({
      ...p,
      latest_package_release_id: p.latest_package_release_id || null,
    })),
  })
})
