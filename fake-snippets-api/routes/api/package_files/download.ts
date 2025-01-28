import { withRouteSpec } from "fake-snippets-api/lib/with-winter-spec"
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
  if (!packageWithVersion) {
    return ctx.error(400, {
      error_code: "invalid_path",
      message: "Invalid path",
    })
  }
  const [packageName, version] = packageWithVersion.split("@")
  const fileName = rest.join("/")

  // Find the snippet
  // const snippet =

  // if (!snippet) {
  //   return ctx.error(404, {
  //     error_code: "snippet_not_found",
  //     message: "Snippet not found",
  //   })
  // }

  // if (!fileName && !jsdelivr_resolve) {
  //   return new Response(
  //     JSON.stringify({
  //       tags: {
  //         latest: "0.0.1",
  //       },
  //       versions: ["0.0.1"],
  //     }),
  //     {
  //       status: 200,
  //       headers: { "Content-Type": "application/json" },
  //     },
  //   )
  // }

  // if (!fileName && jsdelivr_resolve) {
  //   return new Response(
  //     JSON.stringify({
  //       version: "0.0.1",
  //     }),
  //     {
  //       status: 200,
  //       headers: { "Content-Type": "application/json" },
  //     },
  //   )
  // }

  // const latestRelease = await ctx.db
  //   .selectFrom("main.package_release")
  //   .where("package_id", "=", snippet.snippet_id)
  //   .where("is_latest", "=", true)
  //   .selectAll()
  //   .executeTakeFirst()

  // const dtsFile = await ctx.db
  //   .selectFrom("main.package_file")
  //   .where("package_release_id", "=", latestRelease!.package_release_id)
  //   .where("file_path", "=", "/dist/index.d.ts")
  //   .select("content_text")
  //   .executeTakeFirst()

  // // If no fileName is provided, return the directory listing
  // if (!fileName || fileName === "flat") {
  //   const files = [
  //     {
  //       type: "file",
  //       name: "index.ts",
  //       hash: "placeholder_hash",
  //       time: snippet.updated_at,
  //       size: snippet.code?.length ?? 0,
  //     },
  //     {
  //       type: "file",
  //       name: "index.d.ts",
  //       hash: "placeholder_hash",
  //       time: snippet.updated_at,
  //       size: dtsFile?.content_text?.length ?? 0,
  //     },
  //     {
  //       type: "file",
  //       name: "package.json",
  //       hash: "placeholder_hash",
  //       time: snippet.updated_at,
  //       size: JSON.stringify({
  //         name: `@tsci/${owner}.${packageName}`,
  //         version: version || "0.0.1",
  //         main: "index.ts",
  //         types: "index.d.ts",
  //       }).length,
  //     },
  //   ]

  //   const response = {
  //     default: "/index.ts",
  //     files:
  //       fileName === "flat"
  //         ? files.map((f) => ({
  //             name: `/${f.name}`,
  //             hash: f.hash,
  //             time: f.time,
  //             size: f.size,
  //           }))
  //         : [
  //             {
  //               type: "directory",
  //               name: ".",
  //               files: files,
  //             },
  //           ],
  //   }

  //   return new Response(JSON.stringify(response, null, 2), {
  //     status: 200,
  //     headers: { "Content-Type": "application/json" },
  //   })
  // }

  // // Handle file downloads
  // let content: string
  // switch (fileName) {
  //   case "index.ts":
  //     content = snippet.code ?? ""
  //     break
  //   case "index.d.ts":
  //     content = dtsFile?.content_text ?? ""
  //     break
  //   case "package.json":
  //     content = JSON.stringify(
  //       {
  //         name: `@tsci/${owner}.${packageName}`,
  //         version: version || "0.0.1",
  //         main: "index.ts",
  //         types: "index.d.ts",
  //       },
  //       null,
  //       2,
  //     )
  //     break
  //   default:
  //     return ctx.error(404, {
  //       error_code: "file_not_found",
  //       message: "Requested file not found",
  //     })
  // }

  const content = "TODO"

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  })
})
