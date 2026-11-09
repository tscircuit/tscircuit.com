import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import type { Plugin } from "vite"

export type ReferenceDesignPreviewFixture = {
  cli_commit: string
  source_url: string
  files: { file_path: string; content_base64: string }[]
}

export function isReferenceDesignPreviewEnabled(env: NodeJS.ProcessEnv) {
  return (
    env.VERCEL_ENV === "preview" ||
    (!env.VERCEL && env.REFERENCE_DESIGN_PREVIEW === "true")
  )
}

export function referenceDesignPreviewPlugin(): Plugin {
  const fixture: ReferenceDesignPreviewFixture = JSON.parse(
    gunzipSync(
      readFileSync(
        new URL(
          "../playwright-tests/fixtures/ne555-reference-design.json.gz",
          import.meta.url,
        ),
      ),
    ).toString(),
  )
  const files = fixture.files.map(({ file_path, content_base64 }) => ({
    file_path: `/reference-design-preview/${file_path}`,
    content: Buffer.from(content_base64, "base64"),
  }))
  return {
    name: "reference-design-preview",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = files.find(({ file_path }) => req.url === file_path)
        if (!file) return next()
        res.setHeader(
          "Content-Type",
          file.file_path.endsWith(".json")
            ? "application/json"
            : file.file_path.endsWith(".svg")
              ? "image/svg+xml"
              : "application/octet-stream",
        )
        res.end(file.content)
      })
    },
    generateBundle() {
      for (const { file_path, content } of files)
        this.emitFile({
          type: "asset",
          fileName: file_path.slice(1),
          source: content,
        })
    },
  }
}
