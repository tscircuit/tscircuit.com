import {
  createFetchHandlerFromDir,
  createWinterSpecBundleFromDir,
} from "winterspec/adapters/node"
import { Request as EdgeRuntimeRequest } from "@edge-runtime/primitives"
import { join } from "node:path"
import os from "node:os"
import type { Middleware } from "winterspec"
import { createDatabase } from "fake-snippets-api/lib/db/db-client"
import { StripeServer } from "@tscircuit/fake-stripe"

export const startServer = async ({
  port,
  testDbName,
}: { port?: number; testDbName: string }) => {
  const winterspecBundle = await createWinterSpecBundleFromDir(
    join(import.meta.dir, "../../../fake-snippets-api/routes"),
  )

  const db = createDatabase()
  const fakeStripe = new StripeServer()

  const middleware: Middleware[] = [
    async (req: any, ctx: any, next: any) => {
      ;(ctx as any).db = db

      return next(req, ctx)
    },
  ]

  const server = Bun.serve({
    fetch: (bunReq) => {
      const req = new EdgeRuntimeRequest(bunReq.url, {
        headers: bunReq.headers,
        method: bunReq.method,
        body: bunReq.body,
      })

      if (isFakeStripeRoute(bunReq.url)) {
        return fakeStripe.handleRequest(req as any)
      }

      return winterspecBundle.makeRequest(req as any, {
        middleware,
      })
    },
    port: port ?? 0,
  })

  return {
    server: {
      ...server,
      stop: async () => {
        server.stop()
        await fakeStripe.stop()
      },
    },
    db,
    fakeStripe,
    port: server.port,
  }
}

function isFakeStripeRoute(url: string | undefined) {
  if (url == null) return false

  const pathname = new URL(url, "http://localhost").pathname
  return (
    pathname.startsWith("/checkout/") || pathname.startsWith("/v1/checkout/")
  )
}
