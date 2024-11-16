import { createWithWinterSpec } from "winterspec"
import { withDb } from "./with-db"
import { createWithDefaultExceptionHandling } from "winterspec/middleware"
import { withCtxError } from "./with-ctx-error"
import { withSessionAuth } from "./with-session-auth"
import { withOptionalSessionAuth } from "./with-optional-session-auth"
import { withErrorHandling } from "./with-error-handling"
import { withRequestLogging } from "./with-request-logging"

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