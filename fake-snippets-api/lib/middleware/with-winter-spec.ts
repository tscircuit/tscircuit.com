import { createWithWinterSpec } from "winterspec"
import { withDb } from "./with-db"
import { createWithDefaultExceptionHandling } from "winterspec/middleware"
import { withCtxError } from "./with-ctx-error"
import { withSessionAuth } from "./with-session-auth"

export const withRouteSpec = createWithWinterSpec({
  apiName: "tscircuit Snippets API",
  productionServerUrl: "https://snippets.tscircuit.com/api",
  beforeAuthMiddleware: [withCtxError],
  authMiddleware: {
    session: withSessionAuth,
  },
  afterAuthMiddleware: [
    withDb,
    createWithDefaultExceptionHandling({
      includeStackTraceInResponse: true,
    }),
  ],
})
