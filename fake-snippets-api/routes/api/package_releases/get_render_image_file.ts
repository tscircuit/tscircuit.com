import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  canReadFakeRender,
  renderParams,
  renderStore,
  renderKey,
  getRenderPackage,
  publicRender,
  fakeRenderPng,
} from "fake-snippets-api/lib/fake-render-images"
export default withRouteSpec({
  methods: ["GET"],
  auth: "optional_session",
  queryParams: renderParams,
  rawResponse: true,
})(async (req, ctx) => {
  const pkg = getRenderPackage(ctx.db, req.query.package_release_id)
  const row = renderStore(ctx.db).get(renderKey(req.query))
  if (!pkg || !row || !canReadFakeRender(ctx.db, pkg, ctx.auth?.account_id))
    return ctx.error(404, {
      error_code: "render_image_not_found",
      message: "Render image not found",
    })
  if (publicRender(row).status !== "succeeded")
    return ctx.error(409, {
      error_code: "render_image_not_ready",
      message: "Still processing",
    })
  return new Response(new Uint8Array(await fakeRenderPng(req.query.angle)), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  })
})
