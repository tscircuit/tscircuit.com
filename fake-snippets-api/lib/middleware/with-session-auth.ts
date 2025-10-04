import type { Middleware } from "winterspec/middleware"
import type { CtxErrorFn } from "./with-ctx-error"

export const withSessionAuth: Middleware<
  {
    error: CtxErrorFn
    db: any
  },
  {
    auth: {
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

  // Only check database accounts when we're in a Bun test environment
  if (process.env.BUN_TEST === "true" && ctx.db?.accounts) {
    const account = ctx.db.accounts.find((acc: any) => acc.account_id === token)

    if (account) {
      ctx.auth = {
        type: "session",
        account_id: account.account_id,
        personal_org_id: account.personal_org_id || `org-${account.account_id}`,
        github_username: account.github_username,
        session_id: `session-${account.account_id}`,
      }
      return next(req, ctx)
    }
  }

  // For all other environments or if account not found in test, use hardcoded auth
  ctx.auth = {
    type: "session",
    account_id: "account-1234",
    personal_org_id: "org-1234",
    github_username: "testuser",
    session_id: "session-1234",
  }

  return next(req, ctx)
}
