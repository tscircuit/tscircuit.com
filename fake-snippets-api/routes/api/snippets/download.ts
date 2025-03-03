import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  queryParams: z.object({
    jsdelivr_resolve: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true"),
    jsdelivr_path: z.string(),
  }),
  jsonResponse: z.any(),
})(async (req, ctx) => {
  const { jsdelivr_path, jsdelivr_resolve } = req.query

  // Parse the file path
  const [owner, packageWithVersion, ...rest] = jsdelivr_path.split("/")
  const [packageName, version] = packageWithVersion.split("@")
  const fileName = rest.join("/")

  // Find the snippet
  const _package = ctx.db.packages.find(
    (s) => s.owner_github_username === owner && s.unscoped_name === packageName,
  )

  const packageRelease = ctx.db.packageReleases.find(
    (p) => p.package_id === _package?.package_id,
  )

  const packageFiles = ctx.db.packageFiles.filter(
    (p) => p.package_release_id === packageRelease?.package_release_id,
  )

  if (!_package) {
    return ctx.error(404, {
      error_code: "snippet_not_found",
      message: "Snippet not found",
    })
  }

  if (!fileName && !jsdelivr_resolve) {
    return new Response(
      JSON.stringify({
        tags: {
          latest: "0.0.1",
        },
        versions: ["0.0.1"],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } else if (!fileName && jsdelivr_resolve) {
    return new Response(
      JSON.stringify({
        version: "0.0.1",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // If no fileName is provided, return the directory listing
  if (!fileName || fileName === "flat") {
    const files = [
      {
        type: "file",
        name: "index.ts",
        hash: "placeholder_hash",
        time: packageRelease?.created_at,
        size: packageFiles.find((f) => f.file_path === "index.ts")?.content_text?.length,
      },
      {
        type: "file",
        name: "index.d.ts",
        hash: "placeholder_hash",
        time: packageRelease?.created_at,
        size: packageFiles.find((f) => f.file_path === "index.d.ts")?.content_text?.length,
      },
      {
        type: "file",
        name: "package.json",
        hash: "placeholder_hash",
        time: packageRelease?.created_at,
        size: JSON.stringify({
          name: `@tsci/${owner}.${packageName}`,
          version: version || "0.0.1",
          main: "index.ts",
          types: "index.d.ts",
        }).length,
      },
    ]

    const response = {
      default: "/index.ts",
      files:
        fileName === "flat"
          ? files.map((f) => ({
              name: `/${f.name}`,
              hash: f.hash,
              time: f.time,
              size: f.size,
            }))
          : [
              {
                type: "directory",
                name: ".",
                files: files,
              },
            ],
    }

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Handle file downloads
  let content: string
  switch (fileName) {
    case "index.ts":
      content = packageFiles.find((f) => f.file_path === "index.tsx")?.content_text || ""
      break
    case "index.d.ts":
      content = packageFiles.find((f) => f.file_path === "/dist/index.d.ts")?.content_text || ""
      break
    case "package.json":
      content = JSON.stringify(
        {
          name: `@tsci/${owner}.${packageName}`,
          version: version || "0.0.1",
          main: "index.ts",
          types: "index.d.ts",
        },
        null,
        2,
      )
      break
    default:
      return ctx.error(404, {
        error_code: "file_not_found",
        message: "Requested file not found",
      })
  }

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
})
