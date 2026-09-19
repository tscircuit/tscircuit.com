import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  renderParams,
  renderStore,
  renderKey,
  getRenderPackage,
  publicRender,
} from "fake-snippets-api/lib/fake-render-images"
import { z } from "zod"

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: renderParams.extend({
    circuit_json_file_path: z.string().optional(),
    retry_failed: z.boolean().default(false),
    regenerate: z.boolean().default(false),
  }),
  jsonResponse: z.any(),
})(async (req, ctx) => {
  const p = req.jsonBody
  const pkg = getRenderPackage(ctx.db, p.package_release_id)
  if (!pkg)
    return ctx.error(404, {
      error_code: "package_release_not_found",
      message: "Release not found",
    })
  if (pkg.creator_account_id !== ctx.auth.account_id)
    return ctx.error(403, {
      error_code: "render_author_required",
      message: "Only the package author can generate renders",
    })
  const store = renderStore(ctx.db)
  const existing = store.get(renderKey(p))
  if (existing) {
    if (!p.regenerate || publicRender(existing).status !== "succeeded")
      return ctx.json({ render_image: publicRender(existing) })
    const job = {
      ...existing,
      package_release_render_image_id: crypto.randomUUID(),
      created: Date.now(),
    }
    store.set(renderKey(p), job)
    return ctx.json({ render_image: publicRender(job) }, { status: 202 })
  }
  const path = p.circuit_json_file_path || "dist/circuit.json"
  const file = ctx.db.packageFiles.find(
    (f) =>
      f.package_release_id === p.package_release_id &&
      f.file_path.replace(/^(\.\/|\/)+/, "") === path,
  )
  if (!file?.content_text)
    return ctx.error(409, {
      error_code: "circuit_json_not_built",
      message: "Build the release first",
    })
  const job = {
    ...p,
    circuit_json_file_path: path,
    package_release_render_image_id: crypto.randomUUID(),
    created: Date.now(),
  }
  store.set(renderKey(p), job)
  return ctx.json({ render_image: publicRender(job) }, { status: 202 })
})
