import { createDatabase } from "./fake-snippets-api/lib/db/db-client"
import { defineConfig, Plugin, UserConfig } from "vite"
import type { PluginOption } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"
import { getNodeHandler } from "winterspec/adapters/node"
import vercel from "vite-plugin-vercel"

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

export default defineConfig(async (): Promise<UserConfig> => {
  let proxyConfig: Record<string, any> | undefined

  const plugins: PluginOption[] = [
    react(),
    vercel({
      prerender: false,
      buildCommand: "bun run build",
    }),
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
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      reportCompressedSize: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          landing: path.resolve(__dirname, "landing.html"),
        },
      },
    },
    ssr: {
      noExternal: ['react-dom/client'],
      target: 'node',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    logLevel: "info",
  }
})
