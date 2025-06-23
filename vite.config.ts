import { createDatabase } from "./fake-snippets-api/lib/db/db-client"
import { defineConfig, Plugin, UserConfig } from "vite"
import type { PluginOption } from "vite"
import path, { extname } from "path"
import { readFileSync } from "fs"
import { execSync } from "child_process"
import react from "@vitejs/plugin-react"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"
import { getNodeHandler } from "winterspec/adapters/node"
import vercel from "vite-plugin-vercel"
import type { IncomingMessage, ServerResponse } from "http"

// @ts-ignore
import winterspecBundle from "./dist/bundle.js"

// Create database instance with seed data for development
const db = createDatabase({ seed: true })

const fakeHandler = getNodeHandler(winterspecBundle as any, {
  middleware: [
    (req, ctx, next) => {
      ;(ctx as any).db = db
      return next(req, ctx)
    },
  ],
})

function apiFakePlugin(): Plugin {
  return {
    name: "api-fake",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith("/api/")) {
          // simulate slow responses
          await new Promise((resolve) => setTimeout(resolve, 500))
          fakeHandler(req, res)
        } else {
          next()
        }
      })
    },
  }
}

function vercelSsrDevPlugin(): Plugin {
  return {
    name: "vercel-ssr-dev",
    apply: "serve",
    async configureServer(server) {
      const port = server.config.server.port || 5173
      process.env.TSC_DEV_SSR = "true"
      process.env.TSC_BASE_URL = `http://127.0.0.1:${port}`
      process.env.TSC_REGISTRY_API = `http://127.0.0.1:${port}/api`

      const { default: ssrHandler, setHtmlContent } = await import(
        "./api/generated-index.js"
      )

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || ""
        const accept = req.headers.accept || ""

        if (url === "/" || url === "/landing.html") {
          return next()
        }

        if (url.startsWith("/api/")) {
          return next()
        }

        if (!accept.includes("text/html")) {
          return next()
        }

        if (extname(url)) {
          return next()
        }

        const patchedRes = res as ServerResponse & {
          status?: (code: number) => ServerResponse
          send?: (body: any) => void
        }

        if (!patchedRes.status) {
          patchedRes.status = function (code: number) {
            patchedRes.statusCode = code
            return patchedRes
          }
        }

        if (!patchedRes.send) {
          patchedRes.send = function (body: any) {
            if (Buffer.isBuffer(body) || typeof body === "string") {
              patchedRes.end(body)
            } else {
              patchedRes.end(JSON.stringify(body))
            }
          }
        }

        try {
          let rawHtml = readFileSync(
            path.resolve(__dirname, "index.html"),
            "utf-8",
          )
          rawHtml = rawHtml.replace(
            /src="\.\/src\/main\.tsx"/,
            'src="/src/main.tsx"',
          )
          const transformed = await server.transformIndexHtml(url, rawHtml)
          setHtmlContent(transformed)
          await ssrHandler(req as IncomingMessage, patchedRes)
        } catch (err) {
          console.error("SSR handler error", err)
          next()
        }
      })
    }
  }
}

function buildIdPlugin(): Plugin {
  return {
    name: "build-id",
    transformIndexHtml(html) {
      try {
        const hash = execSync("git rev-parse --short HEAD").toString().trim()
        return html.replace(
          /<\/head>/i,
          `  <meta name="tscircuit-build" content="${hash}"></head>`,
        )
      } catch {
        return html
      }
    },
  }
}

export default defineConfig(async (): Promise<UserConfig> => {
  let proxyConfig: Record<string, any> | undefined

  const plugins: PluginOption[] = [
    react(),
    vercel({
      prerender: false,
      buildCommand: "bun run build",
    }),
    ViteImageOptimizer({
      png: {
        quality: 75,
        compressionLevel: 9,
      },
      jpeg: {
        quality: 75,
        progressive: true,
      },
      jpg: {
        quality: 75,
        progressive: true,
      },
      webp: {
        quality: 75,
        lossless: false,
        effort: 6,
      },
      avif: {
        quality: 75,
        effort: 6,
      },
    }),
    vercelSsrDevPlugin(),
    buildIdPlugin(),
  ]

  if (process.env.VITE_BUNDLE_ANALYZE === "true" || 1) {
    const { visualizer } = await import("rollup-plugin-visualizer")
    plugins.push(
      visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    )
  }

  if (!process.env.SNIPPETS_API_URL && !process.env.VERCEL) {
    process.env.VITE_USE_FAKE_API = "true"
    console.log("Using fake snippets API (see ./fake-snippets-api)")
    plugins.push(apiFakePlugin())
  } else {
    console.log(`Using snippets API at "${process.env.SNIPPETS_API_URL}"`)
    process.env.VITE_SNIPPETS_API_URL =
      process.env.VITE_SNIPPETS_API_URL || process.env.SNIPPETS_API_URL
    proxyConfig = {
      "/api": {
        target: process.env.SNIPPETS_API_URL as string,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    }
  }

  return {
    plugins,
    define: {
      global: {},
    },
    server: {
      host: "127.0.0.1",
      proxy: proxyConfig,
    },
    base: "/",
    build: {
      copyPublicDir: true,
      minify: "esbuild",
      // terserOptions: {
      //   compress: {
      //     drop_console: true,
      //     drop_debugger: true,
      //   },
      //   format: {
      //     comments: false,
      //   },
      // },
      reportCompressedSize: true, // https://github.com/vitejs/vite/issues/10086
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          landing: path.resolve(__dirname, "landing.html"),
        },
      },
    },
    ssr: {
      noExternal: ["react-dom/client"],
      target: "node",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    logLevel: "info",
  }
})
