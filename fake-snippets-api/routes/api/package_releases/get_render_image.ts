import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  canReadFakeRender,
  renderParams,
  renderStore,
  renderKey,
  getRenderPackage,
  publicRender,
} from "fake-snippets-api/lib/fake-render-images"
import { z } from "zod"
export default withRouteSpec({
  methods: ["GET", "POST"],
  auth: "optional_session",
  commonParams: renderParams,
  jsonResponse: z.any(),
})(async (req, ctx) => {
  const pkg = getRenderPackage(ctx.db, req.commonParams.package_release_id)
  const row = renderStore(ctx.db).get(renderKey(req.commonParams))
  if (!pkg || !row || !canReadFakeRender(ctx.db, pkg, ctx.auth?.account_id))
    return ctx.error(404, {
      error_code: "render_image_not_found",
      message: "Render image not found",
    })
  return ctx.json({ render_image: publicRender(row) })
})
