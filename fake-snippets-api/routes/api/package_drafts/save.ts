import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
import {
  draftFileSchema,
  packageDraftSchema,
} from "fake-snippets-api/lib/db/schema"
import { z } from "zod"

const isHiddenDraftFile = (path: string): boolean =>
  path
    .split("/")
    .some((segment) => segment === ".env" || segment.startsWith(".env."))

export default withRouteSpec({
  methods: ["POST"],
  auth: "session",
  jsonBody: z.object({
    package_id: z.string().min(1),
    expected_revision: z.number().int().nonnegative(),
    files: z
      .array(draftFileSchema)
      .max(200)
      .refine(
        (files) =>
          new Set(files.map((file) => file.path)).size === files.length,
        "Draft file paths must be unique",
      )
      .refine(
        (files) => files.every((file) => !isHiddenDraftFile(file.path)),
        "Environment files cannot be stored in drafts",
      ),
  }),
  jsonResponse: z.object({
    ok: z.boolean(),
    draft: packageDraftSchema,
    build_triggered: z.literal(false),
  }),
})(async (req, ctx) => {
  const pkg = ctx.db.packages.find(
    (p) => p.package_id === req.jsonBody.package_id,
  )
  if (!pkg) {
    return ctx.error(404, {
      error_code: "package_not_found",
      message: "Package not found",
    })
  }
  if (pkg.creator_account_id !== ctx.auth.account_id) {
    return ctx.error(403, {
      error_code: "forbidden",
      message: "You cannot edit this package draft",
    })
  }

  const draft = ctx.db.savePackageDraft(
    pkg.package_id,
    req.jsonBody.expected_revision,
    req.jsonBody.files,
  )
  if (!draft) {
    return ctx.error(409, {
      error_code: "revision_conflict",
      message: "Draft changed on the server. Reload before saving.",
    })
  }
  return ctx.json({ ok: true, draft, build_triggered: false as const })
})
