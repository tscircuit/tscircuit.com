import type { Middleware } from "winterspec/middleware"
import type { CtxErrorFn } from "./with-ctx-error"
import { decodeJwt } from "jose"

export const withOptionalSessionAuth: Middleware<
  {
    error: CtxErrorFn
    db: any
  },
  {
    auth?: {
      type: "session"
      account_id: string
      personal_org_id: string
      github_username: string
      session_id: string
    }
  },
  {}
> = async (req, ctx, next) => {
  if (req.method === "OPTIONS") return next(req, ctx)

  const token = req.headers.get("authorization")?.split("Bearer ")?.[1]

  if (!token) {
    return next(req, ctx)
  }

  // Try to decode JWT token and verify session exists
  if (ctx.db?.getState) {
    try {
      const decoded = decodeJwt(token)
      const sessionId = decoded.session_id as string

      if (sessionId) {
        const state = ctx.db.getState()

        // Check if session still exists in the database
        const session = state.sessions.find(
          (s: any) => s.session_id === sessionId,
        )

        // If session doesn't exist, treat as unauthenticated (no auth context)
        if (!session) {
          return next(req, ctx)
        }

        // Find account from the decoded token
        const accountId = decoded.account_id as string
        const account = state.accounts.find(
          (acc: any) => acc.account_id === accountId,
        )

        if (account) {
          ctx.auth = {
            type: "session",
            account_id: account.account_id,
            personal_org_id:
              account.personal_org_id || `org-${account.account_id}`,
            github_username: account.github_username,
            session_id: sessionId,
          }
          return next(req, ctx)
        }
      }
    } catch (error) {
      // JWT decode failed, continue to fallback
    }
  }

  // Legacy: Only check database accounts when we're in a Bun test environment
  if (process.env.BUN_TEST === "true" && ctx.db?.accounts) {
    const account = ctx.db.accounts.find((acc: any) => acc.account_id === token)

    if (account) {
      ctx.auth = {
        type: "session",
        account_id: account.account_id,
        personal_org_id: `org-${account.account_id}`,
        github_username: account.github_username,
        session_id: `session-${account.account_id}`,
      }
    }

    return next(req, ctx)
  }

  ctx.auth = {
    type: "session",
    account_id: "account-1234",
    personal_org_id: "org-1234",
    github_username: "testuser",
    session_id: "session-1234",
  }

  return next(req, ctx)
}
