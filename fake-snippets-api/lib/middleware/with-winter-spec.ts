import { createWithWinterSpec } from "winterspec"
import { createWithDefaultExceptionHandling } from "winterspec/middleware"
import { withCtxError } from "./with-ctx-error"
import { withDb } from "./with-db"
import { withErrorHandling } from "./with-error-handling"
import { withOptionalSessionAuth } from "./with-optional-session-auth"
import { withRequestLogging } from "./with-request-logging"
import { withSessionAuth } from "./with-session-auth"

export const withRouteSpec = createWithWinterSpec({
  apiName: "tscircuit Snippets API",
  productionServerUrl: "https://snippets.tscircuit.com/api",
  beforeAuthMiddleware: [withRequestLogging, withErrorHandling, withCtxError],
  authMiddleware: {
    session: withSessionAuth,
    optional_session: withOptionalSessionAuth,
  },
  afterAuthMiddleware: [
    withDb,
    createWithDefaultExceptionHandling({
      includeStackTraceInResponse: true,
    }),
  ],
})
