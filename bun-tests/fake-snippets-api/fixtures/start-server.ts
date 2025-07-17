import os from "node:os"
import { join } from "node:path"
import { Request as EdgeRuntimeRequest } from "@edge-runtime/primitives"
import { createDatabase } from "fake-snippets-api/lib/db/db-client"
import type { Middleware } from "winterspec"
import {
  createFetchHandlerFromDir,
  createWinterSpecBundleFromDir,
} from "winterspec/adapters/node"

export const startServer = async ({
  port,
  testDbName,
}: { port?: number; testDbName: string }) => {
  const winterspecBundle = await createWinterSpecBundleFromDir(
    join(import.meta.dir, "../../../fake-snippets-api/routes"),
  )

  const db = createDatabase()

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
      return winterspecBundle.makeRequest(req as any, {
        middleware,
      })
    },
    port: port ?? 0,
  })

  return {
    server: { ...server, stop: () => server.stop() },
    db,
    port: server.port,
  }
}
