import { createDatabase } from "./fake-snippets-api/lib/db/db-client"
import { defineConfig, Plugin } from "vite"
import path from "path"
import react from "@vitejs/plugin-react"
import { getNodeHandler } from "winterspec/adapters/node"
import { loadFeaturedSnippets } from "./src/lib/loadFeaturedSnippets"

// @ts-ignore
import winterspecBundle from "./dist/bundle.js"

const db = createDatabase({ seed: true })

const fakeHandler = getNodeHandler(winterspecBundle as any, {
  middleware: [
    (req, ctx, next) => {
      ;(ctx as any).db = db
      return next(req, ctx)
    },
  ],
})

async function loadSnippets() {
  const snippets = await loadFeaturedSnippets() // Load snippets here
  return snippets
}

function apiFakePlugin(): Plugin {
  return {
    name: "api-fake",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith("/api/snippets")) {
          const snippets = await loadSnippets() // Serve snippets on this endpoint
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ ok: true, snippets }))
        } else if (req.url?.startsWith("/api/")) {
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

let plugins: any[] = [react()]
let proxy: any = undefined
if (!process.env.SNIPPETS_API_URL && !process.env.VERCEL) {
  process.env.VITE_USE_FAKE_API = "true"
  console.log("Using fake snippets API (see ./fake-snippets-api)")
  plugins.push(apiFakePlugin())
} else {
  console.log(`Using snippets API at "${process.env.SNIPPETS_API_URL}"`)
  process.env.VITE_SNIPPETS_API_URL =
    process.env.VITE_SNIPPETS_API_URL || process.env.SNIPPETS_API_URL
  proxy = {
    "/api": {
      target: process.env.SNIPPETS_API_URL as string,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ""),
    },
  }
}

export default defineConfig({
  plugins,
  define: {
    global: {},
  },
  server: {
    host: "127.0.0.1",
    proxy,
  },
  build: {
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  logLevel: "info",
})
